import { ForwardedRef, forwardRef } from "react";

export const DeleteDialog = forwardRef(
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
          Are you sure you want to remove this ICE server? This action cannot be
          undone.
        </p>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-ghost m-1">Cancel</button>
            <button className="btn btn-error m-1" onClick={handleConfirm}>
              Delete
            </button>
          </form>
        </div>
      </div>
    </dialog>
  ),
);
