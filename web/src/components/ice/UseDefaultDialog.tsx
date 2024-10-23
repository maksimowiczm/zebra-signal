import { ForwardedRef, forwardRef } from "react";

export const UseDefaultDialog = forwardRef(
  (
    {
      handleConfirm,
    }: {
      handleConfirm: () => void;
    },
    ref: ForwardedRef<HTMLDialogElement>,
  ) => (
    <dialog className="modal modal-bottom sm:modal-middle" ref={ref}>
      <div className="modal-box">
        <h3 className="font-bold text-2xl">Are you sure?</h3>
        <p className="py-4 text-justify text-lg">
          Are you sure you want to restore to default ICE servers? This action
          cannot be undone. All custom ICE servers will be removed.
        </p>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-ghost m-1">Cancel</button>
            <button className="btn btn-success m-1" onClick={handleConfirm}>
              Confirm
            </button>
          </form>
        </div>
      </div>
    </dialog>
  ),
);
