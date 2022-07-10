import React from "react";
import {
  DragDropContext,
  Droppable,
  DropResult,
  DragStart,
} from "react-beautiful-dnd";
import { useForm } from "react-hook-form";
import { constSelector, useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import { draggingState, toDoState, IToDoState } from "./atom";
import Board from "./Components/Board";

const Wrapper = styled.div`
  display: flex;
  max-width: 680px;
  width: 100%;
  height: 100vh;
  margin: 0 auto;
  justify-content: center;
  align-items: center;
`;

const Boards = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const DeleteArea = styled.div<{
  dragging: boolean;
  isDraggingOver: boolean;
}>`
  position: absolute;
  bottom: 250px;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 10px 50px;
  transform: ${(props) => (props.isDraggingOver ? "scale(1.5)" : "scale(1)")};
  transition: all 0.1s ease-in;
  border-radius: 15px;
  opacity: ${(props) => (props.dragging ? "1" : "0")};
`;

const Form = styled.form``;

interface IForm {
  board: string;
}

function App() {
  const [dragging, setDragging] = useRecoilState(draggingState);
  const [toDos, setToDos] = useRecoilState(toDoState);
  const onDrangEnd = (info: DropResult) => {
    const { destination, source, type, draggableId } = info;
    setDragging({ card: false, board: false });
    if (!destination) return;
    if (type === "board") {
      setToDos((oldBoards) => {
        const boardsKey = Object.keys(oldBoards);
        const newBoards: IToDoState = {};
        console.log(oldBoards, boardsKey);
        boardsKey.splice(source.index, 1);
        boardsKey.splice(destination.index, 0, draggableId);
        console.log(boardsKey);
        boardsKey.forEach((key) => {
          newBoards[key] = oldBoards[key];
        });
        console.log(oldBoards);
        localStorage.setItem("localList", JSON.stringify(newBoards));
        return newBoards;
      });
    }

    if (
      type === "board" &&
      destination?.droppableId === "delete" &&
      dragging.board === true
    ) {
      setToDos((allBoards) => {
        const newBoards = { ...allBoards };
        delete newBoards[draggableId];
        localStorage.setItem("localList", JSON.stringify(newBoards));
        return newBoards;
      });
    }

    if (
      type === "card" &&
      destination?.droppableId === "delete" &&
      dragging.card === true
    ) {
      setToDos((allBoards) => {
        const sourceBoard = [...allBoards[source.droppableId]];
        sourceBoard.splice(source.index, 1);
        const newBoards = {
          ...allBoards,
          [source.droppableId]: sourceBoard,
        };
        localStorage.setItem("localList", JSON.stringify(newBoards));
        return newBoards;
      });
    }

    if (type === "card" && destination?.droppableId === source.droppableId) {
      // Same Board Moving
      setToDos((allBoards) => {
        const boardCopy = [...allBoards[source.droppableId]];
        const taskObj = boardCopy[source.index];
        boardCopy.splice(source.index, 1);
        boardCopy.splice(destination?.index, 0, taskObj);
        const newBoards = {
          ...allBoards,
          [source.droppableId]: boardCopy,
        };
        localStorage.setItem("localList", JSON.stringify(newBoards));
        return newBoards;
      });
    }
    if (
      type === "card" &&
      destination.droppableId !== source.droppableId &&
      destination.droppableId !== "delete"
    ) {
      setToDos((allBoards) => {
        const sourceBoard = [...allBoards[source.droppableId]];
        const taskObj = sourceBoard[source.index];
        const destinationBoadd = [...allBoards[destination.droppableId]];
        sourceBoard.splice(source.index, 1);
        destinationBoadd.splice(destination.index, 0, taskObj);
        const newBoards = {
          ...allBoards,
          [source.droppableId]: sourceBoard,
          [destination.droppableId]: destinationBoadd,
        };
        localStorage.setItem("localList", JSON.stringify(newBoards));
        return newBoards;
      });
    }
  };
  const onDragStart = (info: DragStart) => {
    if (info.type === "card") {
      setDragging({ card: true, board: false });
    }
    if (info.type === "board") {
      setDragging({ card: false, board: true });
    }
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<IForm>();
  const onVaild = (data: IForm) => {
    if (parseInt(data.board)) {
      setError("board", {
        message: "The name must not consist of only numbers.",
      });
      return;
    }
    setToDos((oldToDos) => {
      const newToDos = { ...oldToDos };
      newToDos[data.board] = [];
      localStorage.setItem("localList", JSON.stringify(newToDos));
      console.log(newToDos);
      return newToDos;
    });
  };
  return (
    <>
      <Form onSubmit={handleSubmit(onVaild)}>
        <span>{errors?.board?.message}</span>
        <input
          {...register("board", { required: true })}
          type="text"
          placeholder="Add Board"
        ></input>
        <button>Add</button>
      </Form>
      <DragDropContext onDragEnd={onDrangEnd} onDragStart={onDragStart}>
        <Wrapper>
          <Droppable droppableId="boards" direction="horizontal" type="board">
            {(magic) => (
              <Boards ref={magic.innerRef} {...magic.droppableProps}>
                {Object.keys(toDos).map((boardId, index) => (
                  <Board
                    key={boardId}
                    boardId={boardId}
                    toDos={toDos[boardId]}
                    index={index}
                  />
                ))}
                {magic.placeholder}
              </Boards>
            )}
          </Droppable>
          <Droppable droppableId="delete" type="card">
            {(magic, snapshot) => (
              <DeleteArea
                ref={magic.innerRef}
                {...magic.droppableProps}
                isDraggingOver={snapshot.isDraggingOver}
                dragging={dragging.card}
              >
                x
              </DeleteArea>
            )}
          </Droppable>
          <Droppable droppableId="delete" type="board">
            {(magic, snapshot) => (
              <DeleteArea
                ref={magic.innerRef}
                {...magic.droppableProps}
                isDraggingOver={snapshot.isDraggingOver}
                dragging={dragging.board}
              >
                x
              </DeleteArea>
            )}
          </Droppable>
        </Wrapper>
      </DragDropContext>
    </>
  );
}

export default App;
