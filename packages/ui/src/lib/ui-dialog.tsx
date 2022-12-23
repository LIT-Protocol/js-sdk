import * as AlertDialog2 from '@radix-ui/react-alert-dialog';

export const AlertDialog = ({
  open = false,
  onClick = () => {},
  btnText = '{ btnText }',
  dialogTitle = '{ dialogTitle }',
  dialogDescription = '{ dialogDescription }',
  btnCancelText = '{ btnCancelText }',
  btnConfirmText = '{ btnConfirmText }',
  hideCancel = true,
}) => (
  <AlertDialog2.Root open={open}>
    <AlertDialog2.Trigger asChild>
      <button onClick={onClick} className="Button violet">
        {btnText}
      </button>
    </AlertDialog2.Trigger>
    <AlertDialog2.Portal>
      <AlertDialog2.Overlay className="AlertDialogOverlay" />
      <AlertDialog2.Content className="AlertDialogContent">
        <AlertDialog2.Title className="AlertDialogTitle">
          {dialogTitle}
        </AlertDialog2.Title>
        <AlertDialog2.Description className="AlertDialogDescription">
          {dialogDescription}
        </AlertDialog2.Description>
        <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
          {hideCancel ? (
            ''
          ) : (
            <AlertDialog2.Cancel asChild>
              <button className="Button mauve">{btnCancelText}</button>
            </AlertDialog2.Cancel>
          )}

          <AlertDialog2.Action asChild>
            <button className="Button red">{btnConfirmText}</button>
          </AlertDialog2.Action>
        </div>
      </AlertDialog2.Content>
    </AlertDialog2.Portal>
  </AlertDialog2.Root>
);
