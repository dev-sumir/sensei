from app.services.pdf_ingestion import chunk_text


def test_chunk_text_splits_large_input() -> None:
    text = "A" * 2600
    chunks = chunk_text(text, chunk_size=1000, overlap=100)

    assert len(chunks) >= 3
    assert len(chunks[0]) == 1000
    assert chunks[1].startswith("A" * 100)


def test_chunk_text_returns_empty_list_for_empty_input() -> None:
    assert chunk_text("") == []

