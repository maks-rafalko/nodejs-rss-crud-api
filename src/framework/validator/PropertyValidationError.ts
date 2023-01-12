class PropertyValidationError {
    constructor(
        public readonly property: string,
        public readonly message: string,
    ) {}

    public getProperty(): string {
        return this.property;
    }

    public getMessage(): string {
        return this.message;
    }
}

export { PropertyValidationError };
