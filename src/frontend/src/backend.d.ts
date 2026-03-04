import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Session {
    id: bigint;
    subject: string;
    createdAt: bigint;
    notes: string;
    questions: Array<Question>;
}
export interface Question {
    id: bigint;
    difficulty: string;
    text: string;
    questionType: string;
}
export interface backendInterface {
    createSession(subject: string, notes: string): Promise<Session>;
    deleteSession(id: bigint): Promise<boolean>;
    getSession(id: bigint): Promise<Session>;
    getSessions(): Promise<Array<Session>>;
}
