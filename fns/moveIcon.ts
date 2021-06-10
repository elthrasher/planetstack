import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateItemOutput } from 'aws-sdk/clients/dynamodb';

import { GameState } from '../repositories/gamestate';
import { notifyClients } from '../repositories/management';
import { MoveIconModel } from '../types/message';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { body } = event;
  try {
    if (body) {
      const message: MoveIconModel = JSON.parse(body);
      const updateIconResult = (await GameState.update(
        {
          icons: { $set: { [message.id]: { img: message.img, x: message.x, y: message.y } } },
        },
        {},
        { ReturnValues: 'ALL_NEW' },
      )) as UpdateItemOutput;
      await notifyClients(event, JSON.stringify(updateIconResult.Attributes));
      return { body: 'OK', statusCode: 200 };
    }
  } catch (e) {
    console.error(e);
    throw new Error('An error has occurred!');
  }
  throw new Error('Missing event body!');
};
