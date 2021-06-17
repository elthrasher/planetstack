import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateItemOutput } from 'aws-sdk/clients/dynamodb';

import { GameState } from '../repositories/gamestate';
import { notifyClients } from '../repositories/management';
import { ChangeBackgroundModel } from '../types/message';

// Receive a payload with a new background id, save it to DynamoDB, then update connected clients.
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { body } = event;
  try {
    if (body) {
      const message: ChangeBackgroundModel = JSON.parse(body);
      const setBGResult = (await GameState.update(
        { bg: message.bg },
        {},
        { ReturnValues: 'ALL_NEW' },
      )) as UpdateItemOutput; // Need to patch incorrect type :/
      await notifyClients(event, JSON.stringify(setBGResult.Attributes));
      return { body: 'OK', statusCode: 200 };
    }
  } catch (e) {
    console.error(e);
    throw new Error('An error has occurred!');
  }
  throw new Error('Missing event body!');
};
