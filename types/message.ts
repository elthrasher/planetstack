import { IconModel } from './icon';
import { MessageAction } from './MessageAction';

export interface AddIconModel {
  action: MessageAction.ADD_ICON;
  icon: IconModel;
}

export interface ChangeBackgroundModel {
  action: MessageAction.CHANGE_BACKGROUND;
  bg: number;
}

export interface DeleteIconModel {
  action: MessageAction.DELETE_ICON;
  id: string;
}

export interface GetStateModel {
  action: MessageAction.GET_STATE;
}

export interface MoveIconModel {
  action: MessageAction.MOVE_ICON;
  id: string;
  img: number;
  x: number;
  y: number;
}

export type MessageModel = AddIconModel | ChangeBackgroundModel | DeleteIconModel | GetStateModel | MoveIconModel;
