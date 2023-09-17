"use client";
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import { TDBinding, TDShape, Tldraw, TldrawApp, useFileSystem } from "@tldraw/tldraw";
import { useCollaborative } from "../hooks/collaborative";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@nextui-org/react";
// @ts-ignore
import { useScreenshot } from "use-react-screenshot";
import * as mobilenet from "@tensorflow-models/mobilenet";
import { EraserIcon, MousePointer, PencilIcon } from 'lucide-react';

interface BoardProps {
  id: string;
}
interface Prediction {
  className: string;
  probability: number;
}

export default function WhiteBoard(props: BoardProps) {
  const { onMount, awareness, yShapes, yBindings, undoManager, doc, tldrawRef, ...events } = useCollaborative(props.id);
  const fileSystemEvents = useFileSystem();
  const [image, takeScreenshot] = useScreenshot()
  const ref = useRef(null);
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isPredicting, setPredicting] = useState<boolean>(false);
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  const onChangePage = useCallback(
    (
      app: TldrawApp,
      shapes: Record<string, TDShape | undefined>,
      bindings: Record<string, TDBinding | undefined>
    ) => {
      undoManager.stopCapturing();
      if (ref.current)
        takeScreenshot(ref.current);
      doc.transact(() => {
        Object.entries(shapes).forEach(([id, shape]) => {
          if (!shape) {
            yShapes.delete(id);
          } else {
            yShapes.set(shape.id, shape);
          }
        });
        Object.entries(bindings).forEach(([id, binding]) => {
          if (!binding) {
            yBindings.delete(id);
          } else {
            yBindings.set(binding.id, binding);
          }
        });
      });
    },
    []
  );


  useEffect(() => {
    if (!model) {
      mobilenet.load().then((m) => {
        console.log("LOADED MODEL.");
        setModel(m);
      })
    }
  }, [model])

  const predict = (img: HTMLImageElement) => {
    console.log("Predict called.")
    if (!model || isPredicting) {
      return;
    }
    setPredicting(true);

    img.onload = () => {
      model.classify(img).then((pred) => {
        setPredicting(false);
        setPredictions(pred);
        console.log(pred);
      })
    }
  }

  const download = (img: HTMLImageElement) => {
    console.log("Download called.")
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    const extra = 0;
    ctx?.drawImage(img, 0, extra, img.width, img.height, 0, extra * 2, img.width, img.height);

    // create a tag
    const a = document.createElement('a');
    a.download = 'download.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
    console.log("e");
  }

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;
    setImg(img);
    predict(img);
  }, [image])

  return (
    <div className="relative h-screen">
      <Button variant="ghost" className="absolute top-5 left-5 z-20" onClick={() => {
        if (img)
          download(img);
      }}>
        Save
      </Button>
      <Button disabled={false} variant="shadow" className="absolute top-5 left-32 z-20" color="primary">
        {!isPredicting ? "Preditions: " : "Loading..."}
        {" | "}
        {predictions.length === 0 ? "No predictions." : `${predictions[0].className} (${predictions[0].probability * 100}% sure)`}
      </Button>
      <div ref={ref} className="dark absolute" style={{ position: 'fixed', inset: 0 }}>
        <Tldraw
          autofocus
          showMenu={false}
          showPages={false}
          // darkMode={true}
          showUI={true}
          showTools={false}
          showZoom={false}
          onMount={onMount}
          onChangePage={onChangePage}
          // onChange={() => takeScreenshot(ref.current)}
          {...fileSystemEvents}
          {...events}
        />
      </div>
      <div className="custom-layout absolute z-20 bottom-10 w-screen flex items-center justify-center">
        <div className="custom-toolbar mx-auto flex gap-4">
          <button disabled={!ref.current}
            className="custom-button"
            onClick={() => tldrawRef.current?.selectTool('select')}
          >
            <MousePointer />
          </button>
          <button disabled={!ref.current}
            className="custom-button"
            // @ts-ignore
            onClick={() => tldrawRef.current?.selectTool("draw")}
          >
            <PencilIcon />
          </button>
          <button disabled={!ref.current}
            className="custom-button"
            onClick={() => tldrawRef.current?.selectTool('erase')}
          >
            <EraserIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
