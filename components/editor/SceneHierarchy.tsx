"use client";

import { useAppSelector, useAppDispatch, selectors } from "@/lib/store/hooks";
import {
  selectObject,
  selectGroup,
  removeObject,
  duplicateObject,
  updateObjectWithHistory,
  toggleLock,
  createGroup,
  addToGroup,
  removeFromGroup,
  deleteGroup,
  updateGroup,
} from "@/lib/store/editorSlice";
import { useState, memo, useMemo } from "react";

interface SceneHierarchyProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SceneHierarchy = memo(function SceneHierarchy({
  isCollapsed,
  onToggleCollapse,
}: SceneHierarchyProps) {
  const dispatch = useAppDispatch();
  const objects = useAppSelector((state) => state.editor.objects);
  const selectedObjectIds = useAppSelector((state) => state.editor.selectedObjectIds);
  const selectedGroupId = useAppSelector((state) => state.editor.selectedGroupId);
  const groups = useAppSelector(selectors.selectGroups);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; objectId: string } | null>(
    null
  );
  const [groupContextMenu, setGroupContextMenu] = useState<{
    x: number;
    y: number;
    groupId: string;
  } | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const handleSelect = (id: string, e?: React.MouseEvent) => {
    const multiSelect = e?.shiftKey || false;
    dispatch(selectObject({ id, multiSelect }));
  };

  const handleContextMenu = (e: React.MouseEvent, objectId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, objectId });
  };

  const handleDuplicate = () => {
    if (contextMenu) {
      dispatch(duplicateObject(contextMenu.objectId));
      setContextMenu(null);
    }
  };

  const handleDelete = () => {
    if (contextMenu) {
      dispatch(removeObject(contextMenu.objectId));
      setContextMenu(null);
    }
  };

  const handleRename = () => {
    if (contextMenu) {
      const object = objects.find((obj) => obj.id === contextMenu.objectId);
      if (object) {
        const newName = prompt("Enter new name:", object.name);
        if (newName && newName.trim()) {
          dispatch(
            updateObjectWithHistory({
              id: contextMenu.objectId,
              updates: { name: newName.trim() },
            })
          );
        }
      }
      setContextMenu(null);
    }
  };

  const handleToggleLock = (objectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleLock(objectId));
  };

  const handleGroupToggle = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleGroupSelect = (groupId: string) => {
    dispatch(selectGroup(groupId));
  };

  const handleGroupContextMenu = (e: React.MouseEvent, groupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setGroupContextMenu({ x: e.clientX, y: e.clientY, groupId });
  };

  const handleGroupRename = () => {
    if (groupContextMenu) {
      const group = groups.find((g) => g.id === groupContextMenu.groupId);
      if (group) {
        const newName = prompt("Enter new name:", group.name);
        if (newName && newName.trim()) {
          dispatch(updateGroup({ id: groupContextMenu.groupId, name: newName.trim() }));
        }
      }
      setGroupContextMenu(null);
    }
  };

  const handleGroupDelete = () => {
    if (groupContextMenu) {
      dispatch(deleteGroup(groupContextMenu.groupId));
      setGroupContextMenu(null);
    }
  };

  const handleAddToGroup = () => {
    if (contextMenu) {
      const object = objects.find((obj) => obj.id === contextMenu.objectId);
      if (object && !object.groupId) {
        const groupOptions = groups.filter((g) => !g.objectIds.includes(contextMenu.objectId));
        if (groupOptions.length > 0) {
          const groupName = prompt(
            `Add to group:\n${groupOptions
              .map((g) => `${g.id}: ${g.name}`)
              .join("\n")}\n\nEnter group ID or 'new' for new group:`,
            "new"
          );
          if (groupName) {
            if (groupName === "new") {
              const newGroupName = prompt("Enter new group name:", "Group 1");
              if (newGroupName) {
                dispatch(createGroup({ name: newGroupName, objectIds: [contextMenu.objectId] }));
              }
            } else {
              const group = groups.find((g) => g.id === groupName);
              if (group) {
                dispatch(addToGroup({ groupId: group.id, objectId: contextMenu.objectId }));
              }
            }
          }
        } else {
          const newGroupName = prompt("Enter new group name:", "Group 1");
          if (newGroupName) {
            dispatch(createGroup({ name: newGroupName, objectIds: [contextMenu.objectId] }));
          }
        }
      }
      setContextMenu(null);
    }
  };

  // Organize objects by group
  const objectsByGroup = useMemo(() => {
    const grouped: Record<string, typeof objects> = {};
    const ungrouped: typeof objects = [];

    objects.forEach((obj) => {
      if (obj.groupId) {
        if (!grouped[obj.groupId]) {
          grouped[obj.groupId] = [];
        }
        grouped[obj.groupId].push(obj);
      } else {
        ungrouped.push(obj);
      }
    });

    return { grouped, ungrouped };
  }, [objects]);

  const getObjectIcon = (type: string) => {
    const icons: Record<string, string> = {
      box: "◻",
      sphere: "●",
      cylinder: "▢",
      cone: "▲",
      torus: "◯",
      plane: "▭",
      model: "🎨",
      ambientLight: "☀",
      directionalLight: "💡",
      pointLight: "⚡",
      spotLight: "🔦",
    };
    return icons[type] || "■";
  };

  return (
    <>
      <div className="w-64 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl flex flex-col">
        <div className="h-10 border-b border-zinc-700 flex items-center px-4 justify-between rounded-t-lg">
          <h2 className="text-sm font-semibold">Scene Hierarchy</h2>
          <button
            onClick={onToggleCollapse}
            className="text-zinc-400 hover:text-white transition-colors text-xl"
            title="Close"
          >
            ×
          </button>
        </div>
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-2">
          {objects.length === 0 ? (
            <div className="text-sm text-zinc-500 text-center mt-4">No objects in scene</div>
          ) : (
            <div className="space-y-0.5">
              {/* Groups */}
              {groups.map((group) => {
                const isExpanded = expandedGroups.has(group.id);
                const groupObjects = objectsByGroup.grouped[group.id] || [];
                return (
                  <div key={group.id}>
                    <div
                      onClick={() => handleGroupSelect(group.id)}
                      onContextMenu={(e) => handleGroupContextMenu(e, group.id)}
                      className={`px-3 py-2 rounded cursor-pointer text-sm flex items-center gap-2 transition-colors ${
                        selectedGroupId === group.id
                          ? "bg-green-600 text-white"
                          : "hover:bg-zinc-700 text-zinc-300"
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGroupToggle(group.id);
                        }}
                        className="text-xs w-4"
                      >
                        {isExpanded ? "▼" : "▶"}
                      </button>
                      <span className="text-base">📦</span>
                      <span className="flex-1 truncate">{group.name}</span>
                      <span className="text-xs opacity-50">({groupObjects.length})</span>
                    </div>
                    {isExpanded && (
                      <div className="ml-6 space-y-0.5">
                        {groupObjects.map((object: (typeof objects)[0]) => (
                          <div
                            key={object.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(object.id, e);
                            }}
                            onContextMenu={(e) => handleContextMenu(e, object.id)}
                            className={`px-3 py-1.5 rounded cursor-pointer text-xs flex items-center gap-2 transition-colors ${
                              selectedObjectIds.includes(object.id)
                                ? "bg-blue-600 text-white"
                                : "hover:bg-zinc-700 text-zinc-300"
                            }`}
                          >
                            <span className="text-sm">{getObjectIcon(object.type)}</span>
                            <span className="flex-1 truncate">{object.name}</span>
                            {object.locked && (
                              <span className="text-xs" title="Locked">
                                🔒
                              </span>
                            )}
                            {!object.visible && <span className="text-xs opacity-50">👁‍🗨</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Ungrouped objects */}
              {objectsByGroup.ungrouped.map((object: (typeof objects)[0]) => (
                <div
                  key={object.id}
                  onClick={(e) => handleSelect(object.id, e)}
                  onContextMenu={(e) => handleContextMenu(e, object.id)}
                  className={`px-3 py-2 rounded cursor-pointer text-sm flex items-center gap-2 transition-colors ${
                    selectedObjectIds.includes(object.id)
                      ? "bg-blue-600 text-white"
                      : "hover:bg-zinc-700 text-zinc-300"
                  }`}
                >
                  <span className="text-base">{getObjectIcon(object.type)}</span>
                  <span className="flex-1 truncate">{object.name}</span>
                  {object.locked && (
                    <button
                      onClick={(e) => handleToggleLock(object.id, e)}
                      className="text-xs hover:opacity-100 opacity-50"
                      title="Locked - Click to unlock"
                    >
                      🔒
                    </button>
                  )}
                  {!object.visible && <span className="text-xs opacity-50">👁‍🗨</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="h-8 border-t border-zinc-700 flex items-center px-4 text-xs text-zinc-500">
          {objects.length} object{objects.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div
            className="fixed bg-zinc-700 rounded shadow-lg py-1 z-50 min-w-[150px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={handleRename}
              className="block w-full text-left px-4 py-2 hover:bg-zinc-600 text-sm"
            >
              Rename
            </button>
            <button
              onClick={handleDuplicate}
              className="block w-full text-left px-4 py-2 hover:bg-zinc-600 text-sm"
            >
              Duplicate
            </button>
            <button
              onClick={handleAddToGroup}
              className="block w-full text-left px-4 py-2 hover:bg-zinc-600 text-sm"
            >
              Add to Group
            </button>
            <div className="border-t border-zinc-600 my-1" />
            <button
              onClick={handleDelete}
              className="block w-full text-left px-4 py-2 hover:bg-red-600 text-sm text-red-400"
            >
              Delete
            </button>
          </div>
        </>
      )}

      {/* Group Context Menu */}
      {groupContextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setGroupContextMenu(null)} />
          <div
            className="fixed bg-zinc-700 rounded shadow-lg py-1 z-50 min-w-[150px]"
            style={{ left: groupContextMenu.x, top: groupContextMenu.y }}
          >
            <button
              onClick={handleGroupRename}
              className="block w-full text-left px-4 py-2 hover:bg-zinc-600 text-sm"
            >
              Rename
            </button>
            <div className="border-t border-zinc-600 my-1" />
            <button
              onClick={handleGroupDelete}
              className="block w-full text-left px-4 py-2 hover:bg-red-600 text-sm text-red-400"
            >
              Delete Group
            </button>
          </div>
        </>
      )}
    </>
  );
});

export default SceneHierarchy;
