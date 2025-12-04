/**
 * Vector mathematics utilities for semantic similarity calculations.
 * Used for comparing content embeddings and calculating SERP competitor centroids.
 */
export class VectorMath {
    /**
     * Calculate cosine similarity between two vectors.
     * Returns a value between -1 and 1, where 1 means identical direction.
     * 
     * Formula: cos(θ) = (A · B) / (||A|| * ||B||)
     * 
     * @param a First vector
     * @param b Second vector
     * @returns Cosine similarity score [0, 1] for normalized vectors
     */
    static cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) {
            throw new Error(`Vector dimensions must match: ${a.length} vs ${b.length}`);
        }

        if (a.length === 0) {
            throw new Error('Vectors cannot be empty');
        }

        // Calculate dot product
        let dotProduct = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
        }

        // Calculate magnitudes
        const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

        // Avoid division by zero
        if (magnitudeA === 0 || magnitudeB === 0) {
            return 0;
        }

        // Cosine similarity
        const similarity = dotProduct / (magnitudeA * magnitudeB);

        // Clamp to [-1, 1] to handle floating point errors
        return Math.max(-1, Math.min(1, similarity));
    }

    /**
     * Calculate the centroid (mean vector) of multiple vectors.
     * This represents the "center" of a cluster of embeddings.
     * 
     * @param vectors Array of vectors to average
     * @returns Centroid vector
     */
    static calculateCentroid(vectors: number[][]): number[] {
        if (vectors.length === 0) {
            throw new Error('Cannot calculate centroid of empty vector array');
        }

        const dimensions = vectors[0].length;

        // Validate all vectors have same dimensions
        for (const vector of vectors) {
            if (vector.length !== dimensions) {
                throw new Error(`All vectors must have same dimensions. Expected ${dimensions}, got ${vector.length}`);
            }
        }

        // Sum all vectors element-wise
        const sum = new Array(dimensions).fill(0);
        for (const vector of vectors) {
            for (let i = 0; i < dimensions; i++) {
                sum[i] += vector[i];
            }
        }

        // Divide by count to get mean
        const centroid = sum.map(val => val / vectors.length);

        return centroid;
    }

    /**
     * Calculate L2 (Euclidean) distance between two vectors.
     * 
     * Formula: ||A - B|| = sqrt(Σ(ai - bi)²)
     * 
     * @param a First vector
     * @param b Second vector
     * @returns L2 distance (always >= 0)
     */
    static l2Distance(a: number[], b: number[]): number {
        if (a.length !== b.length) {
            throw new Error(`Vector dimensions must match: ${a.length} vs ${b.length}`);
        }

        let sumSquares = 0;
        for (let i = 0; i < a.length; i++) {
            const diff = a[i] - b[i];
            sumSquares += diff * diff;
        }

        return Math.sqrt(sumSquares);
    }

    /**
     * Normalize a vector to unit length (magnitude = 1).
     * This is useful for ensuring embeddings are comparable.
     * 
     * @param vector Vector to normalize
     * @returns Normalized vector
     */
    static normalize(vector: number[]): number[] {
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));

        if (magnitude === 0) {
            // Return zero vector if input is zero
            return new Array(vector.length).fill(0);
        }

        return vector.map(val => val / magnitude);
    }

    /**
     * Calculate the average cosine similarity of a vector to a set of vectors.
     * Useful for measuring how well a page aligns with a cluster.
     * 
     * @param vector Target vector
     * @param cluster Array of vectors to compare against
     * @returns Average similarity score
     */
    static averageSimilarityToCluster(vector: number[], cluster: number[][]): number {
        if (cluster.length === 0) {
            return 0;
        }

        const similarities = cluster.map(clusterVector =>
            this.cosineSimilarity(vector, clusterVector)
        );

        return similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
    }

    /**
     * Find the k nearest neighbors to a target vector.
     * 
     * @param target Target vector
     * @param candidates Array of candidate vectors with IDs
     * @param k Number of neighbors to return
     * @returns Array of k nearest neighbors with distances
     */
    static kNearestNeighbors(
        target: number[],
        candidates: Array<{ id: string; vector: number[] }>,
        k: number
    ): Array<{ id: string; distance: number; similarity: number }> {
        // Calculate distances and similarities
        const withDistances = candidates.map(candidate => ({
            id: candidate.id,
            distance: this.l2Distance(target, candidate.vector),
            similarity: this.cosineSimilarity(target, candidate.vector)
        }));

        // Sort by distance (ascending)
        withDistances.sort((a, b) => a.distance - b.distance);

        // Return top k
        return withDistances.slice(0, k);
    }
}
