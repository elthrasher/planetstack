import { IconModel } from './icon';
import { MessageAction } from './MessageAction';

export type AddIconModel = {
  action: MessageAction.ADD_ICON;
  icon: IconModel;
};

export type ChangeBackgroundModel = {
  action: MessageAction.CHANGE_BACKGROUND;
  bg: number;
};

export type DeleteIconModel = {
  action: MessageAction.DELETE_ICON;
  id: string;
};

export type GetStateModel = {
  action: MessageAction.GET_STATE;
};

export type MoveIconModel = {
  action: MessageAction.MOVE_ICON;
  icon: IconModel & { id: string };
};

export type MessageModel = AddIconModel | ChangeBackgroundModel | DeleteIconModel | GetStateModel | MoveIconModel;
