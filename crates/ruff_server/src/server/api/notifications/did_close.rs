use crate::edit::DocumentKey;
use crate::server::api::diagnostics::clear_diagnostics_for_document;
use crate::server::api::LSPResult;
use crate::server::client::{Notifier, Requester};
use crate::server::Result;
use crate::session::Session;
use lsp_types as types;
use lsp_types::notification as notif;

pub(crate) struct DidClose;

impl super::NotificationHandler for DidClose {
    type NotificationType = notif::DidCloseTextDocument;
}

impl super::SyncNotificationHandler for DidClose {
    fn run(
        session: &mut Session,
        notifier: Notifier,
        _requester: &mut Requester,
        types::DidCloseTextDocumentParams {
            text_document: types::TextDocumentIdentifier { uri },
        }: types::DidCloseTextDocumentParams,
    ) -> Result<()> {
        // Publish an empty diagnostic report for the document. This will de-register any existing diagnostics.
        let Some(snapshot) = session.take_snapshot(&uri) else {
            // This is a non-fatal error and we don't want to surface this to the user.
            // If the document snapshot cannot be found, we forgo trying to close the document
            // and return early, logging the failure instead of propagating it.
            tracing::error!("Unable to take snapshot for document with URL {uri}");
            return Ok(());
        };

        clear_diagnostics_for_document(snapshot.query(), &notifier)?;

        let key = snapshot.query().make_key();

        // Notebook cells will go through the `textDocument/didClose` path.
        // We still want to publish empty diagnostics for them, but we
        // shouldn't call `session.close_document` on them.
        if matches!(key, DocumentKey::NotebookCell(_)) {
            return Ok(());
        }

        session
            .close_document(&key)
            .with_failure_code(lsp_server::ErrorCode::InternalError)
    }
}
