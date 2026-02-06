#!/usr/bin/env python3
"""
Simple test script to verify the API is working.
Run this after starting the server: python main.py
"""

import requests
import json
from typing import Optional

BASE_URL = "http://localhost:8000"
TOKEN: Optional[str] = None


def register_user(email: str, password: str) -> dict:
    """Register a new user"""
    url = f"{BASE_URL}/api/users/register"
    data = {"email": email, "password": password}
    response = requests.post(url, json=data)
    print(f"[REGISTER] {response.status_code}")
    return response.json()


def login_user(email: str, password: str) -> dict:
    """Login and get token"""
    global TOKEN
    url = f"{BASE_URL}/api/users/login"
    data = {"email": email, "password": password}
    response = requests.post(url, json=data)
    result = response.json()
    TOKEN = result.get("access_token")
    print(f"[LOGIN] {response.status_code} - Token: {TOKEN[:20]}...")
    return result


def create_author(name: str, biography: str = "") -> dict:
    """Create an author"""
    url = f"{BASE_URL}/api/authors/"
    headers = {"Authorization": f"Bearer {TOKEN}"}
    data = {"name": name, "biography": biography}
    response = requests.post(url, json=data, headers=headers)
    print(f"[CREATE AUTHOR] {response.status_code}")
    return response.json()


def list_authors() -> list:
    """List all authors"""
    url = f"{BASE_URL}/api/authors/"
    headers = {"Authorization": f"Bearer {TOKEN}"}
    response = requests.get(url, headers=headers)
    print(f"[LIST AUTHORS] {response.status_code}")
    return response.json()


def create_book(title: str, description: str = "", isbn: str = "", 
                published_year: int = None, author_ids: list = None) -> dict:
    """Create a book"""
    url = f"{BASE_URL}/api/books/"
    headers = {"Authorization": f"Bearer {TOKEN}"}
    data = {
        "title": title,
        "description": description,
    }
    if isbn:
        data["isbn"] = isbn
    if published_year:
        data["published_year"] = published_year
    if author_ids:
        data["author_ids"] = author_ids
    
    response = requests.post(url, json=data, headers=headers)
    print(f"[CREATE BOOK] {response.status_code}")
    return response.json()


def list_books() -> list:
    """List user's books"""
    url = f"{BASE_URL}/api/books/"
    headers = {"Authorization": f"Bearer {TOKEN}"}
    response = requests.get(url, headers=headers)
    print(f"[LIST BOOKS] {response.status_code}")
    return response.json()


def main():
    """Run test sequence"""
    print("\n" + "="*50)
    print("BIBLIOTHEQUE API - TEST SCRIPT")
    print("="*50 + "\n")
    
    # 1. Register user
    print("1. Testing User Registration...")
    user = register_user("testuser@example.com", "testpass123")
    print(f"   User: {user.get('email')}\n")
    
    # 2. Login user
    print("2. Testing User Login...")
    login_result = login_user("testuser@example.com", "testpass123")
    print(f"   Logged in as: {login_result['user']['email']}\n")
    
    # 3. Create authors
    print("3. Creating Authors...")
    author1 = create_author("J.K. Rowling", "British author of Harry Potter")
    print(f"   Author: {author1.get('name')} (ID: {author1.get('id')})")
    
    author2 = create_author("George R. R. Martin", "American author")
    print(f"   Author: {author2.get('name')} (ID: {author2.get('id')})\n")
    
    # 4. List authors
    print("4. Listing Authors...")
    authors = list_authors()
    print(f"   Total authors: {len(authors)}\n")
    
    # 5. Create books
    print("5. Creating Books...")
    book1 = create_book(
        "Harry Potter and the Sorcerer's Stone",
        "A young wizard's first year at Hogwarts",
        "978-0-439-13959-0",
        1998,
        [author1.get('id')]
    )
    print(f"   Book: {book1.get('title')} (ID: {book1.get('id')})")
    
    book2 = create_book(
        "A Game of Thrones",
        "The beginning of an epic fantasy series",
        "978-0-553-58327-8",
        1996,
        [author2.get('id')]
    )
    print(f"   Book: {book2.get('title')} (ID: {book2.get('id')})\n")
    
    # 6. List books
    print("6. Listing User's Books...")
    books = list_books()
    print(f"   Total books: {len(books)}\n")
    for book in books:
        print(f"   - {book.get('title')} ({book.get('published_year')})")
    
    print("\n" + "="*50)
    print("ALL TESTS PASSED!")
    print("="*50 + "\n")


if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to server!")
        print("Make sure the server is running: python main.py")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
