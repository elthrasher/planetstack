import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateItemOutput } from 'aws-sdk/clients/dynamodb';
import KSUID from 'ksuid';

import { GameState } from '../repositories/gamestate';
import { notifyClients } from '../repositories/management';
import { AddIconModel } from '../types/message';

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
