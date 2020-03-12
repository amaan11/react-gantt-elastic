import GanttElasticContext from "@/GanttElasticContext";
import { emitEvent } from "@/GanttElasticEvents";
import { Task } from "@/types";
import _ from "lodash";
import React, { useContext, useMemo, useState } from "react";

/**
 * Is current expander collapsed?
 *
 * @param tasks
 */
function collapseState(tasks: Array<Task>): boolean {
  if (tasks.length === 0) {
    return false;
  }
  let collapsed = 0;
  for (let i = 0, len = tasks.length; i < len; i++) {
    if (tasks[i].collapsed) {
      collapsed++;
    }
  }
  return collapsed === tasks.length;
}

/**
 * Get specific class prefix
 *
 * @param type
 * @param full
 */
function getClassPrefix(type: string, full = true): string {
  return `${full ? "gantt-elastic__" : ""}${type}-expander`;
}

export interface ExpanderProps {
  type: string;
  tasks: Array<Task>;
}

const Expander: React.FC<ExpanderProps> = ({ type, tasks }) => {
  const {
    style,
    options: { taskList },
    dispatch
  } = useContext(GanttElasticContext);
  const { expander } = taskList;

  const [state] = useState({
    border: 0.5,
    borderStyle: {
      strokeWidth: 0.5
    },
    lineOffset: 5
  });

  const { collapsed, toggle, allChildren } = useMemo(() => {
    const collapsed = collapseState(tasks);
    /**
     * Toggle expander
     */
    const toggle = (): void => {
      if (tasks.length === 0) {
        return;
      }
      // const collapse = !collapsed;
      // tasks.forEach(task => {
      //   task.collapsed = collapse;
      // });
      // dispatch({
      //   type: "taskList-collapsed-change",
      //   payload: {}
      // });
      emitEvent.emit("taskList-collapsed-change", tasks, !collapsed);
    };
    /**
     * Get all tasks
     */
    const allChildren: Task[] = [];
    _.forEach(tasks, task => {
      _.forEach(task.allChildren, childId => {
        allChildren.push(childId);
      });
    });

    return { collapsed, toggle, allChildren };
  }, [tasks]);

  const fullClassPrefix = getClassPrefix(expander.type);
  const notFullClassPrefix = getClassPrefix(expander.type, false);

  const taskListStyle =
    type !== "taskList"
      ? {}
      : {
          paddingLeft:
            tasks[0]?.parents.length * expander.padding +
            expander.margin +
            "px",
          margin: "auto 0"
        };

  return (
    <div
      className={fullClassPrefix + "-wrapper"}
      style={{
        ...style[notFullClassPrefix + "-wrapper"],
        ...taskListStyle
      }}
    >
      {allChildren.length > 0 && (
        <svg
          className={fullClassPrefix + "-content"}
          style={{ ...style[notFullClassPrefix + "-content"] }}
          width={expander.size}
          height={expander.size}
          onClick={toggle}
        >
          <rect
            className={fullClassPrefix + "-border"}
            style={{
              ...style[notFullClassPrefix + "-border"],
              ...state.borderStyle
            }}
            x={state.border}
            y={state.border}
            width={expander.size - state.border * 2}
            height={expander.size - state.border * 2}
            rx="2"
            ry="2"
          ></rect>
          <line
            className={fullClassPrefix + "-line"}
            style={{ ...style[notFullClassPrefix + "-line"] }}
            x1={state.lineOffset}
            y1={expander.size / 2}
            x2={expander.size - state.lineOffset}
            y2={expander.size / 2}
          ></line>
          {collapsed && (
            <line
              className={fullClassPrefix + "-line"}
              style={{ ...style[notFullClassPrefix + "-line"] }}
              x1={expander.size / 2}
              y1={state.lineOffset}
              x2={expander.size / 2}
              y2={expander.size - state.lineOffset}
            ></line>
          )}
        </svg>
      )}
    </div>
  );
};

export default Expander;