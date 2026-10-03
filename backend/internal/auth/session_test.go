package auth

import (
	"crypto/sha256"
	"encoding/base64"
	"testing"
)

func TestHashSessionToken(t *testing.T) {
	rawToken := "test-token-123"
	wantHash := sha256.Sum256([]byte(rawToken))
	want := base64.RawURLEncoding.EncodeToString(wantHash[:])

	if got := hashSessionToken(rawToken); got != want {
		t.Fatalf("hashSessionToken(%q) = %q, want %q", rawToken, got, want)
	}
}
