import { error } from "node:console";

export const MALFORMED_PUNCH_REQUEST = { error: "malformed_punch_request", error_description: "missing secret body parameters"};
export const STUDENT_NOT_FOUND = { error: "student_not_found", error_description: "student not found"};
export const MALFORMED_CREATE_STUDENT_REQUEST = { error: "malformed_create_student_request", error_description: "missing fullName and secret parameters"};
export const CREATE_STUDENT_FAILED = { error: "create_student_failed", error_description: "failed to create the student"};
export const MALFORMED_GET_STUDENT_REQUEST = { error: "malformed_get_student_request", error_description: "missing secret or id parameters"};
export const STUDENT_EXISTS = { error: "student_exists", error_description: "a student with that secret exists"};