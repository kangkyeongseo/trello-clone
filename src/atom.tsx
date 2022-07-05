import { atom } from "recoil";

const LOCAL_LIST = "localList";

const defaltList = {
  "To Do": [],
  Doing: [],
  Done: [],
};

export interface ITodo {
  id: number;
  text: string;
}

export interface IToDoState {
  [key: string]: ITodo[];
}

const getLocal = localStorage.getItem(LOCAL_LIST) || JSON.stringify(defaltList);

export const toDoState = atom<IToDoState>({
  key: "toDo",
  default: JSON.parse(getLocal),
});

export const draggingState = atom({
  key: "isDragging",
  default: false,
});
