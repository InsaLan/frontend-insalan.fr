<template>
    <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"></div>
        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div class="relative transform overflow-hidden rounded-lg bg-theme-bg text-left shadow-xl transition-all sm:my-8 sm:max-w-lg">
                    <div class="bg-theme-bg px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                <div class="flex flex-row">
                                    <slot name="icon">
                                        <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-300 sm:mx-0 sm:h-10 sm:w-10">
                                            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                            </svg>
                                        </div>
                                    </slot>
                                    <div class="ml-2 border-b-2 border-white w-full flex flex-col justify-center">
                                        <slot name="title">
                                            <h3 class="text-base font-semibold leading-6 text-white-900" id="modal-title">Default title</h3>
                                        </slot>
                                    </div>
                                </div>
                                <div class="w-64">
                                    <slot name="body">
                                        <div class="mt-2">
                                            <p class="text-sm text-gray-300">This is the default body.</p>
                                        </div>
                                    </slot>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="px-4 pb-4 sm:flex sm:flex-row-reverse sm:px-6 items-center justify-center">
                        <slot name="buttons">
                            <button type="button" class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto">Continue</button>
                            <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 sm:mt-0 sm:w-auto">Cancel</button>
                        </slot>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
