from database import Base, engine
from models import Document  # Import all your models here

def reset_database():
    # Drop all tables
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)

    # Recreate all tables
    print("Recreating tables...")
    Base.metadata.create_all(bind=engine)

    print("Database has been reset!")

if __name__ == "__main__":
    reset_database()
