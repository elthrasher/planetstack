import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateItemOutput } from 'aws-sdk/clients/dynamodb';
import KSUID from 'ksuid';

import { GameState } from '../repositories/gamestate';
import { notifyClients } from '../repositories/management';
import { AddIconModel } from '../types/message';

// Receive a payload as a new icon, generate a ksuid for it and save it to DynamoDB, then notifiy all connected clients.
// ksuid is used here, but doesn't gain any real sorting benefits. This could be any kind of unique id.
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { body } = event;
  try {
    if (body) {
      const message: AddIconModel = JSON.parse(body);
      const ksuid = await KSUID.random();
      const addIconResult = (await GameState.update(
        { icons: { $set: { [`icon${ksuid.string}`]: message.icon } } },
        {},
        { ReturnValues: 'ALL_NEW' },
      )) as UpdateItemOutput; // Need to patch incorrect type :/
      await notifyClients(event, JSON.stringify(addIconResult.Attributes));
      return { body: 'OK', statusCode: 200 };
    }
  } catch (e) {
    console.error(e);
    throw new Error('An error has occurred!');
  }
  throw new Error('Missing event body!');
};
