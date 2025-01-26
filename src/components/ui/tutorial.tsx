import clsx from "clsx";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export default function Tutorial({
  contentList,
}: {
  contentList: [string, ReactNode][];
}) {
  const elementRef = useRef<HTMLElement>(null);
  const [idIndex, setIdIndex] = useState(0);
  const [node, setNode] = useState<ReactNode | null>(null);
  const [isFinished, setIsFinished] = useState(
    window.localStorage.getItem("tutorial") === "finished"
  );

  const onNext = () => {
    const isAlreadyFinished =
      window.localStorage.getItem("tutorial") === "finished";
    if (isAlreadyFinished) return;

    if (elementRef.current !== null) {
      elementRef.current.style.zIndex = "";
    }

    const content = contentList[idIndex];
    if (content !== undefined) {
      const [index, node] = content;
      const element = document.getElementById(index);

      if (element !== null) {
        elementRef.current = element;
        element.style.zIndex = "9999";

        setNode(node);
        setIdIndex((i) => i + 1);
      }
    } else {
      window.localStorage.setItem("tutorial", "finished");
      setIsFinished(true);
    }
  };

  useEffect(() => {
    onNext();
  }, []);

  return createPortal(
    <div
      className={clsx(
        isFinished && "hidden",
        "fixed inset-0 bg-[#000]/80 text-white font-medium flex items-start justify-end flex-col gap-y-8 p-[6rem] text-3xl"
      )}
    >
      <div className="max-w-[26rem]">{node}</div>
      <button
        type="button"
        onClick={onNext}
        className="text-white border border-white rounded-md text-sm font-bold hover:cursor-pointer hover:bg-white/10 transition-colors duration-150 px-8 py-2"
      >
        Continue
      </button>
    </div>,
    document.body
  );
}
