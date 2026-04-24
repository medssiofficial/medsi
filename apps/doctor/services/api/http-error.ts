export class HttpError extends Error {
	status: number;

	constructor(args: { status: number; message: string }) {
		super(args.message);
		this.name = "HttpError";
		this.status = args.status;
	}
}
