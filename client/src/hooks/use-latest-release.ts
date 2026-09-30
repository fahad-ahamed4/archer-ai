"use client";

import { useState, useEffect, useCallback } from "react";

// =====================================================
// Hook to fetch latest release info from GitHub Releases
// =====================================================
// This allows the download buttons in Settings to:
// - Show actual download status (available / not available / loading)
// - Provide DIRECT download URLs (not GitHub web page)
// - Show a "trigger build" prompt when no release is available yet
// =====================================================

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  content_type: string;
  size: number;
  download_count: number;
}

interface ReleaseInfo {
  tagName: string;
  releaseName: string;
  releaseUrl: string;
  publishedAt: string;
  body: string;
  assets: ReleaseAsset[];
}

interface UseReleaseResult {
  release: ReleaseInfo | null;
  loading: boolean;
  error: string | null;
  hasWindowsBuild: boolean;
  hasAndroidBuild: boolean;
  windowsAsset: ReleaseAsset | null;
  androidAsset: ReleaseAsset | null;
  refetch: () => void;
}

const GITHUB_REPO = "fahad-ahamed4/archer-ai";
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const GITHUB_RELEASES_PAGE = `https://github.com/${GITHUB_REPO}/releases`;
const GITHUB_ACTIONS_URL = `https://github.com/${GITHUB_REPO}/actions/workflows/build-release.yml`;

export function useLatestRelease(): UseReleaseResult {
  const [release, setRelease] = useState<ReleaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRelease = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(GITHUB_API, {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      });

      if (res.status === 404) {
        // No releases yet — that's OK, just means no builds available
        setRelease(null);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`GitHub API returned ${res.status}`);
      }

      const data = await res.json();
      const info: ReleaseInfo = {
        tagName: data.tag_name || "unknown",
        releaseName: data.name || data.tag_name || "Release",
        releaseUrl: data.html_url || GITHUB_RELEASES_PAGE,
        publishedAt: data.published_at || data.created_at || "",
        body: data.body || "",
        assets: (data.assets || []).map((a: any) => ({
          name: a.name,
          browser_download_url: a.browser_download_url,
          content_type: a.content_type,
          size: a.size,
          download_count: a.download_count,
        })),
      };
      setRelease(info);
      setLoading(false);
    } catch (e: any) {
      console.warn("[useLatestRelease] fetch error:", e?.message);
      setError(e?.message || "Failed to fetch release info");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchRelease(), 0);
    return () => clearTimeout(t);
  }, [fetchRelease]);

  // Identify Windows (.exe) and Android (.apk) assets
  const windowsAsset = release?.assets.find(
    (a) => a.name.toLowerCase().endsWith(".exe")
  ) || null;

  const androidAsset = release?.assets.find(
    (a) => a.name.toLowerCase().endsWith(".apk")
  ) || null;

  return {
    release,
    loading,
    error,
    hasWindowsBuild: !!windowsAsset,
    hasAndroidBuild: !!androidAsset,
    windowsAsset,
    androidAsset,
    refetch: fetchRelease,
  };
}

// Helper: format file size in human-readable form
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

// Helper: format date
export function formatReleaseDate(isoDate: string): string {
  if (!isoDate) return "";
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoDate;
  }
}

// Exported constants for use in UI
export {
  GITHUB_REPO,
  GITHUB_RELEASES_PAGE,
  GITHUB_ACTIONS_URL,
};
