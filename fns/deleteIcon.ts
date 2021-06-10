import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { notifyClients } from '../repositories/management';
import { db, tableName } from '../repositories/table';
import { DeleteIconModel } from '../types/message';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { body } = event;
  try {
    if (body) {
      const message: DeleteIconModel = JSON.parse(body);
      const deleteIconResult = await db
        .update({
          Key: { pk: 'GS', sk: 'GS' },
          ReturnValues: 'ALL_NEW',
          TableName: tableName,
          UpdateExpression: `REMOVE icons.${message.id}`,
        })
        .promise();
      await notifyClients(event, JSON.stringify(deleteIconResult.Attributes));
      return { body: 'OK', statusCode: 200 };
    }
  } catch (e) {
    console.error(e);
    throw new Error('An error has occurred!');
  }
  throw new Error('Missing event body!');
};
