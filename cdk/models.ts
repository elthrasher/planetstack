import { CfnModel, WebSocketApi } from '@aws-cdk/aws-apigatewayv2';
import { Stack } from '@aws-cdk/core';

import { MessageAction } from '../types/MessageAction';

// Create `CfnModel` from properties.
const getModel = (
  scope: Stack,
  modelName: string,
  properties: Record<string, { enum?: string[]; $ref?: string; type?: string }>,
  required: string[],
  webSocketApi: WebSocketApi,
) => {
  return new CfnModel(scope, `${modelName}Model`, {
    apiId: webSocketApi.apiId,
    contentType: 'application/json',
    name: `${modelName}Model`,
    schema: {
      $schema: 'http://json-schema.org/draft-04/schema#',
      properties,
      required,
      title: `${modelName}Schema`,
      type: 'object',
    },
  });
};

// Create models for validation. It's possible to generate models from TypeScript interfaces or types.
// See https://matt.martz.codes/how-to-automatically-generate-request-models-from-typescript-interfaces for some inspiration.
export const getModels = (scope: Stack, webSocketApi: WebSocketApi): { [key: string]: CfnModel } => {
  const iconModel = getModel(
    scope,
    'Icon',
    {
      id: { type: 'string' },
      img: { type: 'number' },
      x: { type: 'number' },
      y: { type: 'number' },
    },
    ['img', 'x', 'y'],
    webSocketApi,
  );

  const addModel = getModel(
    scope,
    'Add',
    {
      action: { enum: [MessageAction.ADD_ICON] },
      icon: { $ref: `https://apigateway.amazonaws.com/restapis/${webSocketApi.apiId}/models/${iconModel.ref}` },
    },
    ['action', 'icon'],
    webSocketApi,
  );

  const changeBgModel = getModel(
    scope,
    'ChangeBackground',
    { action: { enum: [MessageAction.CHANGE_BACKGROUND] }, bg: { type: 'number' } },
    ['action', 'bg'],
    webSocketApi,
  );

  const deleteModel = getModel(
    scope,
    'Delete',
    { action: { enum: [MessageAction.DELETE_ICON] }, id: { type: 'string' } },
    ['action', 'id'],
    webSocketApi,
  );

  const getStateModel = getModel(
    scope,
    'GetState',
    { action: { enum: [MessageAction.GET_STATE] } },
    ['action'],
    webSocketApi,
  );

  const moveModel = getModel(
    scope,
    'Move',
    {
      action: { enum: [MessageAction.MOVE_ICON] },
      icon: { $ref: `https://apigateway.amazonaws.com/restapis/${webSocketApi.apiId}/models/${iconModel.ref}` },
    },
    ['action', 'icon'],
    webSocketApi,
  );

  return { addModel, changeBgModel, deleteModel, getStateModel, moveModel };
};
