import { JsonSchema, JsonSchemaType } from '@aws-cdk/aws-apigateway';
import { CfnModel, WebSocketApi } from '@aws-cdk/aws-apigatewayv2';
import { Stack } from '@aws-cdk/core';

import { MessageAction } from '../types/MessageAction';

// Create `CfnModel` from properties.
const getModel = (
  scope: Stack,
  modelName: string,
  properties: {
    [name: string]: JsonSchema;
  },
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
  // Was unable to get $ref to work which is the preferred JsonSchema way to do this.
  // Saved here by imperative code that will duplicate this nested model in our Cfn.
  // Should work and does in RestAPI, but haven't gotten this to work in V2 spec
  // https://docs.aws.amazon.com/apigateway/latest/developerguide/models-mappings.html
  const iconModel = {
    properties: {
      id: { type: JsonSchemaType.STRING },
      img: { type: JsonSchemaType.NUMBER },
      x: { type: JsonSchemaType.NUMBER },
      y: { type: JsonSchemaType.NUMBER },
    },
    required: ['img', 'x', 'y'],
    type: JsonSchemaType.OBJECT,
  };

  const addModel = getModel(
    scope,
    'Add',
    {
      action: { enum: [MessageAction.ADD_ICON] },
      icon: iconModel,
    },
    ['action', 'icon'],
    webSocketApi,
  );

  const changeBgModel = getModel(
    scope,
    'ChangeBackground',
    { action: { enum: [MessageAction.CHANGE_BACKGROUND] }, bg: { type: JsonSchemaType.NUMBER } },
    ['action', 'bg'],
    webSocketApi,
  );

  const deleteModel = getModel(
    scope,
    'Delete',
    { action: { enum: [MessageAction.DELETE_ICON] }, id: { type: JsonSchemaType.STRING } },
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
      icon: iconModel,
    },
    ['action', 'icon'],
    webSocketApi,
  );

  return { addModel, changeBgModel, deleteModel, getStateModel, moveModel };
};
