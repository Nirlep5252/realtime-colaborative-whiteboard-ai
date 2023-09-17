import * as Y from "yjs";
// @ts-ignore
import { WebsocketProvider } from "y-websocket";
import { TDBinding, TDShape, TDUser, TldrawApp } from "@tldraw/tldraw";
import { useCallback, useEffect, useRef } from "react";

export function useCollaborative(id: string) {
  const doc = new Y.Doc();
  const provider = new WebsocketProvider(
    process.env.WEBSOCKET_URL || "ws://localhost:1234",
    id,
    doc,
    {
      connect: true
    }
  );
  // const UPLOAD_URL = "";
  const awareness = provider.awareness;

  const yShapes: Y.Map<TDShape> = doc.getMap("shapes");
  const yBindings: Y.Map<TDBinding> = doc.getMap("bindings");
  const undoManager = new Y.UndoManager([yShapes, yBindings]);

  const tldrawRef = useRef<TldrawApp>();

  const onMount = useCallback(
    (app: TldrawApp) => {
      app.loadRoom(id);
      app.pause();
      tldrawRef.current = app;

      app.replacePageContent(
        Object.fromEntries(yShapes.entries()),
        Object.fromEntries(yBindings.entries()),
        {}
      );
    },
    [id]
  );

  const onUndo = useCallback(() => {
    undoManager.undo();
  }, []);

  const onRedo = useCallback(() => {
    undoManager.redo();
  }, []);

  /**
   * Callback to update user's (self) presence
   */
  const onChangePresence = useCallback((app: TldrawApp, user: TDUser) => {
    awareness.setLocalStateField("tdUser", user);
  }, []);

  /**
   * Update app users whenever there is a change in the room users
   */
  useEffect(() => {
    const onChangeAwareness = () => {
      const tldraw = tldrawRef.current;

      if (!tldraw || !tldraw.room) return;

      const others = Array.from(awareness.getStates().entries())
        // @ts-ignore
        .filter(([key, _]) => key !== awareness.clientID)
        // @ts-ignore
        .map(([_, state]) => state)
        // @ts-ignore
        .filter((user) => user.tdUser !== undefined);

      // @ts-ignore
      const ids = others.map((other) => other.tdUser.id as string);

      Object.values(tldraw.room.users).forEach((user) => {
        if (user && !ids.includes(user.id) && user.id !== tldraw.room?.userId) {
          tldraw.removeUser(user.id);
        }
      });

      // @ts-ignore
      tldraw.updateUsers(others.map((other) => other.tdUser).filter(Boolean));
    };

    awareness.on("change", onChangeAwareness);

    return () => awareness.off("change", onChangeAwareness);
  }, []);

  useEffect(() => {
    function handleChanges() {
      const tldraw = tldrawRef.current;

      if (!tldraw) return;

      tldraw.replacePageContent(
        Object.fromEntries(yShapes.entries()),
        Object.fromEntries(yBindings.entries()),
        {}
      );
    }

    yShapes.observeDeep(handleChanges);

    return () => yShapes.unobserveDeep(handleChanges);
  }, []);

  useEffect(() => {
    function handleDisconnect() {
      provider.disconnect();
    }
    window.addEventListener("beforeunload", handleDisconnect);

    return () => window.removeEventListener("beforeunload", handleDisconnect);
  }, []);

  return {
    onMount,
    onUndo,
    onRedo,
    onChangePresence,
    awareness,
    undoManager,
    yShapes,
    yBindings,
    doc,
    tldrawRef
  };
}
