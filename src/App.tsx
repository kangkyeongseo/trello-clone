import {
  DragDropContext,
  Droppable,
  DropResult,
  DragStart,
} from "react-beautiful-dnd";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import { draggingState, toDoState } from "./atom";
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

function App() {
  const [dragging, setDragging] = useRecoilState(draggingState);
  const [toDos, setToDos] = useRecoilState(toDoState);
  const onDrangEnd = (info: DropResult) => {
    console.log(info);
    const { destination, source, draggableId } = info;
    setDragging(false);
    if (!destination) return;
    if (destination?.droppableId === "delete") {
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
    if (destination?.droppableId === source.droppableId) {
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
    setDragging(true);
  };

  return (
    <DragDropContext onDragEnd={onDrangEnd} onDragStart={onDragStart}>
      <Wrapper>
        <Droppable droppableId="boards" direction="horizontal">
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
        <Droppable droppableId="delete">
          {(magic, snapshot) => (
            <DeleteArea
              ref={magic.innerRef}
              {...magic.droppableProps}
              isDraggingOver={snapshot.isDraggingOver}
              dragging={dragging}
            >
              x
            </DeleteArea>
          )}
        </Droppable>
      </Wrapper>
    </DragDropContext>
  );
}

export default App;
