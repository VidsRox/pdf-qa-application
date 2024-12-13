from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database connection URL
DATABASE_URL = "postgresql://neondb_owner:Tw7yiq9YzkoB@ep-yellow-voice-a5pjm4n7-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
