import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import ApiGatewayManagementApi from 'aws-sdk/clients/apigatewaymanagementapi';
import { UpdateItemOutput } from 'aws-sdk/clients/dynamodb';
import KSUID from 'ksuid';

import { GameState } from '../repositories/gamestate';
import { db, tableName } from '../repositories/table';
import { User } from '../repositories/users';
import { AddIconModel, ChangeBackgroundModel, DeleteIconModel, MessageModel, MoveIconModel } from '../types/message';
import { MessageAction } from '../types/MessageAction';
import { UserModel } from '../types/user';

const checkMessageSize = async (message: string): Promise<string> => {
  if (Buffer.byteLength(message) > 30000) {
    console.log('Size limit reached. Resetting game!');
    await GameState.put({ bg: 0, icons: {} });
    return JSON.stringify({ bg: 0, icons: {} });
  }
  return message;
};

const getMgmtApi = (event: APIGatewayProxyEvent): ApiGatewayManagementApi =>
  new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage,
  });

const notifyClients = async (apigwManagementApi: ApiGatewayManagementApi, message: string): Promise<void> => {
  message = await checkMessageSize(message);
  const cids = await User.query('USER', {}, { ProjectionExpression: 'cid' });

  const postCalls = cids.Items.filter((i: UserModel) => i.cid).map(async ({ cid }: { cid: string }) => {
    try {
      await apigwManagementApi.postToConnection({ ConnectionId: cid, Data: message }).promise();
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${cid}`);
        await User.delete({ cid });
      } else {
        throw e;
      }
    }
  });

  await Promise.all(postCalls);
};

const addIcon = async (mgmtApi: ApiGatewayManagementApi, message: AddIconModel) => {
  const ksuid = await KSUID.random();
  const addIconResult = (await GameState.update(
    { icons: { $set: { [`icon${ksuid.string}`]: message.icon } } },
    {},
    { ReturnValues: 'ALL_NEW' },
  )) as UpdateItemOutput; // Need to patch incorrect type :/
  await notifyClients(mgmtApi, JSON.stringify(addIconResult.Attributes));
};

const changeBackground = async (mgmtApi: ApiGatewayManagementApi, message: ChangeBackgroundModel) => {
  const setBGResult = (await GameState.update({ bg: message.bg }, {}, { ReturnValues: 'ALL_NEW' })) as UpdateItemOutput; // Need to patch incorrect type :/
  await notifyClients(mgmtApi, JSON.stringify(setBGResult.Attributes));
};

const deleteIcon = async (mgmtApi: ApiGatewayManagementApi, message: DeleteIconModel) => {
  // dynamodb-toolbox sadly doesn't support removing nested attributes by name.
  const deleteIconResult = await db
    .update({
      Key: { pk: 'GS', sk: 'GS' },
      ReturnValues: 'ALL_NEW',
      TableName: tableName,
      UpdateExpression: `REMOVE icons.${message.id}`,
    })
    .promise();
  await notifyClients(mgmtApi, JSON.stringify(deleteIconResult.Attributes));
};

const getState = async (mgmtApi: ApiGatewayManagementApi, cid?: string) => {
  const gs = await GameState.get({});
  if (!gs.Item) {
    await GameState.put({ bg: 0, icons: {} });
  }
  if (cid && gs.Item) {
    await mgmtApi
      .postToConnection({
        ConnectionId: cid,
        Data: JSON.stringify(gs.Item),
      })
      .promise();
  }
};

const moveIcon = async (mgmtApi: ApiGatewayManagementApi, message: MoveIconModel) => {
  const updateIconResult = (await GameState.update(
    {
      icons: { $set: { [message.id]: { img: message.img, x: message.x, y: message.y } } },
    },
    {},
    { ReturnValues: 'ALL_NEW' },
  )) as UpdateItemOutput;
  await notifyClients(mgmtApi, JSON.stringify(updateIconResult.Attributes));
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { body } = event;
  const mgmtApi = getMgmtApi(event);
  try {
    if (body) {
      const message: MessageModel = JSON.parse(body);
      switch (message.action) {
        case MessageAction.ADD_ICON:
          await addIcon(mgmtApi, message);
          break;
        case MessageAction.CHANGE_BACKGROUND:
          await changeBackground(mgmtApi, message);
          break;
        case MessageAction.DELETE_ICON:
          await deleteIcon(mgmtApi, message);
          break;
        case MessageAction.GET_STATE:
          await getState(mgmtApi, event.requestContext.connectionId);
          break;
        case MessageAction.MOVE_ICON:
          await moveIcon(mgmtApi, message);
          break;
      }

      return { body: 'OK', statusCode: 200 };
    }
  } catch (e) {
    console.error(e);
    throw new Error('An error has occurred!');
  }
  throw new Error('Missing event body!');
};
