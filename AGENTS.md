# Agents in pi

This document describes how agents interact with the `pi` harness and the conventions used.

## Principles

1.  **Atomic Operations**: Break down large tasks into smaller, manageable steps.
2.  **Verify Often**: Use `bash` or `read` to verify the state of the filesystem or the results of a command before proceeding.
3.  **Small Edits**: When using `edit`, keep `oldText` as small as possible to minimize matching failures.
4.  **Avoid Truncation**: If a file or response is very large, use `offset` and `limit` with `read`, or write in chunks if necessary.

## Handling Large Files/Responses

If a task requires writing or reading a large amount of data, follow these practices to avoid "Response was truncated before completion":

### Reading Large Files
Do not attempt to `read` a massive file in one go. Use the `offset` and `limit` parameters.

### Writing Large Files
If a single `write` call is too large and may be truncated:
1.  Write the file in chunks using `offset` (if applicable, though the current `write` tool doesn't support offset, so one must use `bash` to append or rewrite).
2.  Alternatively, use `bash` with `cat << 'EOF' > filename` for larger chunks.
3.  Break the content into multiple `write` calls if the tool allows, though `write` overwrites.
4.  The best way for very large files is to use `bash` to build the file incrementally (e.g., `echo "part1" > file; echo "part2" >> file`).

### Managing Context
If you feel the context is getting too heavy, summarize your progress and state clearly in the next turn.
