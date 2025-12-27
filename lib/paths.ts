/**
 * Path utilities for asset loading
 *
 * Handles base path prefixing for production deployments (GitHub Pages).
 * This ensures assets like default-quiz.json are fetched correctly
 * regardless of the deployment path (e.g. /quiz-srs/).
 */

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/**
 * Prepends the base path to a given asset path.
 *
 * @param path - The path to the asset (e.g. '/default-quiz.json')
 * @returns The full path (e.g. '/quiz-srs/default-quiz.json')
 */
export function getAssetPath(path: string): string {
  // Remove leading slash if present to avoid double slashes when joining
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // If base path is present, join it. Otherwise just return the path.
  // Note: We avoid trailing slash issues by assuming BASE_PATH doesn't have one
  // or handling it if it does. Next.js basePath usually doesn't have trailing slash.
  return BASE_PATH ? `${BASE_PATH}/${cleanPath}` : `/${cleanPath}`;
}
