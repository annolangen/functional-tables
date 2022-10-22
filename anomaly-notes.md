In many tables numeric columns are related.
Think of, Olympic medal counts by country, maybe also listing GDP and population size.
A linear approximation around the column means often captures this relationship.
We can center all the numeric columns, solve argmin_x_k | A_k x_k - y_k |\_2 for each column y_k where A_k is the matrix of the remaining centered columns.
Then A_k x_k is a "least squares prediction" of y_k given the linear relationship.
Compute the standard deviation of the prediction error.
Then, we can highlight anomalies based on [z-score](https://en.wikipedia.org/wiki/Standard_score).
An uncorrelated column will have large "errors" and insignificant z-scores.
A notable outlier in a correlated column, however, should be found with a high z-score.

Finding the prediction parameters, x_k, for all numeric columns may be less expensive than it sounds at first.
One idea is to use the QR decomposition of the entire, centered matrix A.
Then use Algorithm 2.13 from [Incremental QR](http://eprints.ma.man.ac.uk/1192/1/qrupdating_12nov08.pdf) once for each column.
