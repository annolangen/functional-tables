import { blasAxpy, blasDot } from './blas';
import { Float64Matrix, matrix } from './float64matrix';

// Returns the singular values, q, and complete orthogonal
// decomposition of a real rectangular matrix. Based on SVD procedure
// in "Singular Value Decomposition and Least Squares Solutions. By
// G.H. Golub et al."
//   a = u diag(q) v^t
//   u^t u = I
//   v^t v = I
// for [q, u, v] = svd(a).
export function svd(
  a: Float64Matrix,
  eps?: number,
  tol?: number,
): { q: Float64Array; u: Float64Matrix; v: Float64Matrix } {
  eps = eps || Math.pow(2, -52);
  tol = 1e-64 / eps;

  // Householder's reduction to bidiagonal form

  const n = a.cols;
  const m = a.length / n;

  if (m < n) throw new TypeError('Invalid matrix: m < n');

  let l = 0;
  let g = 0;
  let x = 0;
  const e = new Float64Array(m);
  const q = new Float64Array(n);
  const u = matrix(a.slice(0), n);
  const v = matrix(new Float64Array(n * n), n);
  const subColumnDot = (
    startIndex: number,
    x: Float64Array,
    i: number,
    y: Float64Array,
    j: number,
  ) =>
    blasDot(m - startIndex, x, n, startIndex * n + i, y, n, startIndex * n + j);
  const subRowDot = (
    startIndex: number,
    x: Float64Array,
    i: number,
    y: Float64Array,
    j: number,
  ) =>
    blasDot(n - startIndex, x, 1, i * n + startIndex, y, 1, j * n + startIndex);

  for (let i = 0; i < n; i++) {
    e[i] = g;
    let s = subColumnDot(i, u, i, u, i);
    l = i + 1;
    if (s < tol) {
      g = 0;
    } else {
      const f = u[n * i + i];
      g = f < 0 ? Math.sqrt(s) : -Math.sqrt(s);
      const h = f * g - s;
      u[i * n + i] = f - g;
      for (let j = l; j < n; j++) {
        s = subColumnDot(i, u, i, u, j);
        const f = s / h;
        blasAxpy(m - i, f, u, n, i * n + i, u, n, i * n + j);
      }
    }
    q[i] = g;
    s = subRowDot(l, u, i, u, i);
    if (s < tol) {
      g = 0;
    } else {
      const f = u[i * n + i + 1];
      g = f < 0 ? Math.sqrt(s) : -Math.sqrt(s);
      const h = f * g - s;
      u[i * n + i + 1] = f - g;
      for (let j = l; j < n; j++) e[j] = u[i * n + j] / h;
      for (let j = l; j < m; j++) {
        s = subRowDot(l, u, i, u, j);
        blasAxpy(n - l, s, e, 1, l, u, 1, j * n + l);
      }
    }
    const y = Math.abs(q[i]) + Math.abs(e[i]);
    if (y > x) {
      x = y;
    }
  }

  // Accumulation of right-hand transformations
  for (let i = n - 1; i >= 0; i--) {
    if (g !== 0) {
      const h = u[i * n + i + 1] * g;
      for (let j = l; j < n; j++) v[j * n + i] = u[i * n + j] / h;
      for (let j = l; j < n; j++) {
        let s = blasDot(n - l, u, 1, i * n + l, v, n, l * n + j);
        blasAxpy(n - l, s, v, n, l * n + i, v, n, l * n + j);
      }
    }
    for (let j = l; j < n; j++) {
      v[i * n + j] = 0;
      v[j * n + i] = 0;
    }
    v[i * n + i] = 1;
    g = e[i];
    l = i;
  }

  // Accumulation of left-hand transformations
  for (let i = n - 1; i >= 0; i--) {
    l = i + 1;
    const g = q[i];
    for (let j = l; j < n; j++) u[i * n + j] = 0;
    if (g !== 0) {
      const h = u[i * n + i] * g;
      for (let j = l; j < n; j++) {
        let s = subColumnDot(l, u, i, u, j);
        const f = s / h;
        blasAxpy(m - i, f, u, n, i * n + i, u, n, i * n + j);
      }
      for (let j = i; j < m; j++) u[j * n + i] /= g;
    } else {
      for (let j = i; j < m; j++) u[j * n + i] = 0;
    }
    u[i * n + i] += 1;
  }

  // Diagonalization of the bidiagonal form
  eps = eps * x;
  let testConvergence: boolean;
  for (let k = n - 1; k >= 0; k--) {
    for (let iteration = 0; iteration < 50; iteration++) {
      // test-f-splitting
      testConvergence = false;
      for (l = k; l >= 0; l--) {
        if (Math.abs(e[l]) <= eps) {
          testConvergence = true;
          break;
        }
        if (Math.abs(q[l - 1]) <= eps) {
          break;
        }
      }

      if (!testConvergence) {
        // cancellation of e[l] if l>0
        let c = 0;
        let s = 1;
        const l1 = l - 1;
        for (let i = l; i < k + 1; i++) {
          let f = s * e[i];
          e[i] = c * e[i];
          if (Math.abs(f) <= eps) {
            break; // goto test-f-convergence
          }
          let g = q[i];
          q[i] = Math.sqrt(f * f + g * g);
          const h = q[i];
          c = g / h;
          s = -f / h;
          for (let j = 0; j < m; j++) {
            const y = u[j * n + l1];
            const z = u[j * n + i];
            u[j * n + l1] = y * c + z * s;
            u[j * n + i] = -y * s + z * c;
          }
        }
      }

      // test f convergence
      const z = q[k];
      if (l === k) {
        // convergence
        if (z < 0) {
          // q[k] is made non-negative
          q[k] = -z;
          for (let j = 0; j < n; j++) v[j * n + k] *= -1;
        }
        break; // break out of iteration loop and move on to next k value
      }

      // Shift from bottom 2x2 minor
      x = q[l];
      const y = q[k - 1];
      let g = e[k - 1];
      const h = e[k];
      let f = ((y - z) * (y + z) + (g - h) * (g + h)) / (2 * h * y);
      g = Math.sqrt(f * f + 1);
      f = ((x - z) * (x + z) + h * (y / (f < 0 ? f - g : f + g) - h)) / x;

      // Next QR transformation
      let c = 1;
      let s = 1;
      for (let i = l + 1; i < k + 1; i++) {
        let g = e[i];
        let y = q[i];
        let h = s * g;
        g = c * g;
        let z = Math.sqrt(f * f + h * h);
        e[i - 1] = z;
        c = f / z;
        s = h / z;
        f = x * c + g * s;
        g = -x * s + g * c;
        h = y * s;
        y = y * c;
        for (let j = 0; j < n; j++) {
          const x = v[j * n + i - 1];
          const z = v[j * n + i];
          v[j * n + i - 1] = x * c + z * s;
          v[j * n + i] = -x * s + z * c;
        }
        z = Math.sqrt(f * f + h * h);
        q[i - 1] = z;
        c = f / z;
        s = h / z;
        f = c * g + s * y;
        x = -s * g + c * y;
        for (let j = 0; j < m; j++) {
          const y = u[j * n + i - 1];
          const z = u[j * n + i];
          u[j * n + i - 1] = y * c + z * s;
          u[j * n + i] = -y * s + z * c;
        }
      }
      e[l] = 0;
      e[k] = f;
      q[k] = x;
    }
  }

  // Number below eps should be zero
  for (let i = 0; i < n; i++) {
    if (q[i] < eps) q[i] = 0;
  }

  return { u, q, v };
}

// Original definition from https://github.com/danilosalvati/svd-js, for benchmarking.
export const SVD = (a, withu?, withv?, eps?, tol?) => {
  // Define default parameters
  withu = withu !== undefined ? withu : true;
  withv = withv !== undefined ? withv : true;
  eps = eps || Math.pow(2, -52);
  tol = 1e-64 / eps;

  // throw error if a is not defined
  if (!a) {
    throw new TypeError('Matrix a is not defined');
  }

  // Householder's reduction to bidiagonal form

  const n = a[0].length;
  const m = a.length;

  if (m < n) {
    throw new TypeError('Invalid matrix: m < n');
  }

  let i;
  let j;
  let k;
  let l;
  let l1;
  let c;
  let f;
  let g;
  let h;
  let s;
  let x;
  let y;
  let z;

  g = 0;
  x = 0;
  const e = [];

  const u = [];
  const v = [];

  const mOrN = withu === 'f' ? m : n;

  // Initialize u
  for (i = 0; i < m; i++) {
    u[i] = new Array(mOrN).fill(0);
  }

  // Initialize v
  for (i = 0; i < n; i++) {
    v[i] = new Array(n).fill(0);
  }

  // Initialize q
  const q = new Array(n).fill(0);

  // Copy array a in u
  for (i = 0; i < m; i++) {
    for (j = 0; j < n; j++) {
      u[i][j] = a[i][j];
    }
  }

  for (i = 0; i < n; i++) {
    e[i] = g;
    s = 0;
    l = i + 1;
    for (j = i; j < m; j++) {
      s += Math.pow(u[j][i], 2);
    }
    if (s < tol) {
      g = 0;
    } else {
      f = u[i][i];
      g = f < 0 ? Math.sqrt(s) : -Math.sqrt(s);
      h = f * g - s;
      u[i][i] = f - g;
      for (j = l; j < n; j++) {
        s = 0;
        for (k = i; k < m; k++) {
          s += u[k][i] * u[k][j];
        }
        f = s / h;
        for (k = i; k < m; k++) {
          u[k][j] = u[k][j] + f * u[k][i];
        }
      }
    }
    q[i] = g;
    s = 0;
    for (j = l; j < n; j++) {
      s += Math.pow(u[i][j], 2);
    }
    if (s < tol) {
      g = 0;
    } else {
      f = u[i][i + 1];
      g = f < 0 ? Math.sqrt(s) : -Math.sqrt(s);
      h = f * g - s;
      u[i][i + 1] = f - g;
      for (j = l; j < n; j++) {
        e[j] = u[i][j] / h;
      }
      for (j = l; j < m; j++) {
        s = 0;
        for (k = l; k < n; k++) {
          s += u[j][k] * u[i][k];
        }
        for (k = l; k < n; k++) {
          u[j][k] = u[j][k] + s * e[k];
        }
      }
    }
    y = Math.abs(q[i]) + Math.abs(e[i]);
    if (y > x) {
      x = y;
    }
  }

  // Accumulation of right-hand transformations
  if (withv) {
    for (i = n - 1; i >= 0; i--) {
      if (g !== 0) {
        h = u[i][i + 1] * g;
        for (j = l; j < n; j++) {
          v[j][i] = u[i][j] / h;
        }
        for (j = l; j < n; j++) {
          s = 0;
          for (k = l; k < n; k++) {
            s += u[i][k] * v[k][j];
          }
          for (k = l; k < n; k++) {
            v[k][j] = v[k][j] + s * v[k][i];
          }
        }
      }
      for (j = l; j < n; j++) {
        v[i][j] = 0;
        v[j][i] = 0;
      }
      v[i][i] = 1;
      g = e[i];
      l = i;
    }
  }

  // Accumulation of left-hand transformations
  if (withu) {
    if (withu === 'f') {
      for (i = n; i < m; i++) {
        for (j = n; j < m; j++) {
          u[i][j] = 0;
        }
        u[i][i] = 1;
      }
    }
    for (i = n - 1; i >= 0; i--) {
      l = i + 1;
      g = q[i];
      for (j = l; j < mOrN; j++) {
        u[i][j] = 0;
      }
      if (g !== 0) {
        h = u[i][i] * g;
        for (j = l; j < mOrN; j++) {
          s = 0;
          for (k = l; k < m; k++) {
            s += u[k][i] * u[k][j];
          }
          f = s / h;
          for (k = i; k < m; k++) {
            u[k][j] = u[k][j] + f * u[k][i];
          }
        }
        for (j = i; j < m; j++) {
          u[j][i] = u[j][i] / g;
        }
      } else {
        for (j = i; j < m; j++) {
          u[j][i] = 0;
        }
      }
      u[i][i] = u[i][i] + 1;
    }
  }

  // Diagonalization of the bidiagonal form
  eps = eps * x;
  let testConvergence;
  for (k = n - 1; k >= 0; k--) {
    for (let iteration = 0; iteration < 50; iteration++) {
      // test-f-splitting
      testConvergence = false;
      for (l = k; l >= 0; l--) {
        if (Math.abs(e[l]) <= eps) {
          testConvergence = true;
          break;
        }
        if (Math.abs(q[l - 1]) <= eps) {
          break;
        }
      }

      if (!testConvergence) {
        // cancellation of e[l] if l>0
        c = 0;
        s = 1;
        l1 = l - 1;
        for (i = l; i < k + 1; i++) {
          f = s * e[i];
          e[i] = c * e[i];
          if (Math.abs(f) <= eps) {
            break; // goto test-f-convergence
          }
          g = q[i];
          q[i] = Math.sqrt(f * f + g * g);
          h = q[i];
          c = g / h;
          s = -f / h;
          if (withu) {
            for (j = 0; j < m; j++) {
              y = u[j][l1];
              z = u[j][i];
              u[j][l1] = y * c + z * s;
              u[j][i] = -y * s + z * c;
            }
          }
        }
      }

      // test f convergence
      z = q[k];
      if (l === k) {
        // convergence
        if (z < 0) {
          // q[k] is made non-negative
          q[k] = -z;
          if (withv) {
            for (j = 0; j < n; j++) {
              v[j][k] = -v[j][k];
            }
          }
        }
        break; // break out of iteration loop and move on to next k value
      }

      // Shift from bottom 2x2 minor
      x = q[l];
      y = q[k - 1];
      g = e[k - 1];
      h = e[k];
      f = ((y - z) * (y + z) + (g - h) * (g + h)) / (2 * h * y);
      g = Math.sqrt(f * f + 1);
      f = ((x - z) * (x + z) + h * (y / (f < 0 ? f - g : f + g) - h)) / x;

      // Next QR transformation
      c = 1;
      s = 1;
      for (i = l + 1; i < k + 1; i++) {
        g = e[i];
        y = q[i];
        h = s * g;
        g = c * g;
        z = Math.sqrt(f * f + h * h);
        e[i - 1] = z;
        c = f / z;
        s = h / z;
        f = x * c + g * s;
        g = -x * s + g * c;
        h = y * s;
        y = y * c;
        if (withv) {
          for (j = 0; j < n; j++) {
            x = v[j][i - 1];
            z = v[j][i];
            v[j][i - 1] = x * c + z * s;
            v[j][i] = -x * s + z * c;
          }
        }
        z = Math.sqrt(f * f + h * h);
        q[i - 1] = z;
        c = f / z;
        s = h / z;
        f = c * g + s * y;
        x = -s * g + c * y;
        if (withu) {
          for (j = 0; j < m; j++) {
            y = u[j][i - 1];
            z = u[j][i];
            u[j][i - 1] = y * c + z * s;
            u[j][i] = -y * s + z * c;
          }
        }
      }
      e[l] = 0;
      e[k] = f;
      q[k] = x;
    }
  }

  // Number below eps should be zero
  for (i = 0; i < n; i++) {
    if (q[i] < eps) q[i] = 0;
  }

  return { u, q, v };
};
