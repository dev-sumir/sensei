from typing import Any

from .supabase import execute, fetch_rows


async def create_or_update_profile(user_id: str, email: str | None, name: str | None, avatar_url: str | None) -> None:
    await execute(
        """
        insert into profiles (id, email, name, avatar_url)
        values ($1, $2, $3, $4)
        on conflict (id) do update
        set email = excluded.email,
            name = excluded.name,
            avatar_url = excluded.avatar_url
        """,
        user_id,
        email,
        name,
        avatar_url,
    )


async def create_document(user_id: str, title: str, storage_path: str, status: str) -> dict[str, Any]:
    rows = await fetch_rows(
        """
        insert into documents (user_id, title, storage_path, status)
        values ($1, $2, $3, $4)
        returning id::text, user_id::text, title, storage_path, status, created_at::text
        """,
        user_id,
        title,
        storage_path,
        status,
    )
    return dict(rows[0])


async def update_document_status(document_id: str, status: str) -> None:
    await execute("update documents set status = $2 where id = $1", document_id, status)


async def delete_document_db(document_id: str, user_id: str) -> None:
    await execute("delete from documents where id = $1 and user_id = $2", document_id, user_id)


async def store_document_chunks(document_id: str, chunks: list[str], embeddings: list[list[float]]) -> None:
    for chunk, embedding in zip(chunks, embeddings, strict=True):
        vector = "[" + ",".join(f"{value:.8f}" for value in embedding) + "]"
        await execute(
            """
            insert into document_chunks (document_id, chunk_text, embedding)
            values ($1, $2, $3::vector)
            """,
            document_id,
            chunk,
            vector,
        )


async def get_documents_for_user(user_id: str) -> list[dict[str, Any]]:
    rows = await fetch_rows(
        """
        select
          d.id::text,
          d.user_id::text,
          d.title,
          d.storage_path,
          d.status,
          d.created_at::text,
          c.id::text as conversation_id,
          (
            select m.content
            from messages m
            where m.conversation_id = c.id
            order by m.created_at desc
            limit 1
          ) as last_message_preview
        from documents d
        left join conversations c on c.document_id = d.id and c.user_id = d.user_id
        where d.user_id = $1
        order by d.created_at desc
        """,
        user_id,
    )
    return [dict(row) for row in rows]


async def get_document_for_user(document_id: str, user_id: str) -> dict[str, Any] | None:
    rows = await fetch_rows(
        """
        select id::text, user_id::text, title, storage_path, status, created_at::text
        from documents
        where id = $1 and user_id = $2
        limit 1
        """,
        document_id,
        user_id,
    )
    return dict(rows[0]) if rows else None


async def get_or_create_conversation(user_id: str, document_id: str, title: str | None = None) -> dict[str, Any]:
    rows = await fetch_rows(
        """
        insert into conversations (user_id, document_id, title)
        values ($1, $2, $3)
        on conflict (user_id, document_id) do update
        set title = coalesce(conversations.title, excluded.title)
        returning id::text, user_id::text, document_id::text, title, created_at::text
        """,
        user_id,
        document_id,
        title,
    )
    return dict(rows[0])


async def create_message(conversation_id: str, role: str, content: str) -> dict[str, Any]:
    rows = await fetch_rows(
        """
        insert into messages (conversation_id, role, content)
        values ($1, $2, $3)
        returning id::text, role, content, created_at::text
        """,
        conversation_id,
        role,
        content,
    )
    return dict(rows[0])


async def get_messages_for_conversation(conversation_id: str) -> list[dict[str, Any]]:
    rows = await fetch_rows(
        """
        select id::text, role, content, created_at::text
        from messages
        where conversation_id = $1
        order by created_at asc
        """,
        conversation_id,
    )
    return [dict(row) for row in rows]
