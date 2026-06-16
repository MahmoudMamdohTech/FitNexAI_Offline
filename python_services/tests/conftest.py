import pytest
from fastapi.testclient import TestClient
from main import app
from database import engine, Base
import asyncio

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables in the SQLite database before running tests."""
    import os
    if os.path.exists("test.db"):
        os.remove("test.db")
        
    async def create_tables():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
    asyncio.run(create_tables())
    yield
    # No teardown needed for in-memory sqlite
