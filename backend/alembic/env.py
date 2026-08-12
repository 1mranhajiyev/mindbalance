from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import Base

# Import all models so Alembic can detect them
from app.models.user import User
from app.models.profile import PatientProfile, PsychologistProfile
from app.models.checkin import CheckIn
from app.models.goal import Goal, GoalProgressLog
from app.models.session import TherapySession
from app.models.note import TherapyNote, JournalEntry
from app.models.task import Task
from app.models.audit import AuditLog
from app.models.notification import Notification
from app.models.payment import Payment
from app.models.material import Material, PatientMaterial
from app.models.milestone import TherapyMilestone, PatientAchievement, TherapyLearning

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def include_object(object, name, type_, reflected, compare_to):
    # Never let Alembic auto-manage enum types — migrations handle them via raw SQL
    if type_ == "type":
        return False
    return True


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=include_object,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_object=include_object,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
