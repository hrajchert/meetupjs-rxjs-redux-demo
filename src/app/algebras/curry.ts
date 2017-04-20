export interface ICurry1<A, B> {
    (a: A): B;
}

export interface ICurry2<A, B, C> {
    (a: A): ((b: B) => C);
}
