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
      const { icon } = message;
      const updateIconResult = (await GameState.update(
        {
          icons: { $set: { [icon.id]: { img: icon.img, x: icon.x, y: icon.y } } },
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
