"""
FitNex AI — Async Database Layer (SQLAlchemy 2.x + asyncpg)
"""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from config import settings

# NullPool is required when using Supabase's Transaction Pooler (port 6543)
# because pgbouncer in transaction mode does not support prepared statements.
# NullPool creates a fresh connection for every request and never caches them,
# which avoids the DuplicatePreparedStatementError entirely.
connect_args = {}
if not settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    }

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    poolclass=NullPool,
    connect_args=connect_args,
)

# session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    """Yield a transactional async session, auto-close on exit."""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def create_tables():
    """Create all tables defined by ORM models."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
