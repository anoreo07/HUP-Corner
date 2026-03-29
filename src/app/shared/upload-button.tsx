'use client';

import { useModal } from '@/app/shared/modal-views/use-modal';
import { Button } from 'rizzui';

type ExportButtonProps = {
  modalView: React.ReactNode;
};

export default function UploadButton({ modalView }: ExportButtonProps) {
  const { openModal } = useModal();
  return (
    <Button
      className="mt-4 w-full @lg:mt-0 @lg:w-auto"
      onClick={() =>
        openModal({
          view: modalView,
        })
      }
    >
      Upload
    </Button>
  );
}
