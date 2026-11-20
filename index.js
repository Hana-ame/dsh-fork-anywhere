/**
 * Host half of dsh-fork-anywhere.
 *
 * The whole feature is a Client-side entry: the shipped Host `session/fork`
 * Remote already accepts any existing event seq (`atSeq`, inclusive cut), so
 * no Host service, tool, or route is needed. The bundle still needs this row
 * so the package can be installed and the Client module resolved.
 */
export function apply() {}