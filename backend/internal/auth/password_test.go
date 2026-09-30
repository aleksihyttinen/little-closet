package auth

import "testing"

func TestPasswordHash(t *testing.T) {
	password := "correct horse battery staple"

	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("hashPassword() error = %v", err)
	}

	if hash == password {
		t.Fatal("password was stored as plaintext")
	}

	ok, err := VerifyPassword(password, hash)
	if err != nil {
		t.Fatalf("verifyPassword() error = %v", err)
	}

	if !ok {
		t.Fatal("correct password was rejected")
	}

	ok, err = VerifyPassword("wrong password", hash)
	if err != nil {
		t.Fatalf("verifyPassword() error = %v", err)
	}

	if ok {
		t.Fatal("incorrect password was accepted")
	}
}
