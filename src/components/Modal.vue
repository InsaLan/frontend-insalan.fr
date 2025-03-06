<template>
  <div aria-labelledby="modal-title" aria-modal="true" class="relative z-50" role="dialog">
    <div class="fixed inset-0 bg-gray-900/75 transition-opacity"/>
    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative overflow-hidden rounded-lg bg-theme-bg text-left shadow-xl transition-all sm:my-8 sm:max-w-[75%]">
          <div class="bg-theme-bg px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 w-full text-center sm:mt-0 sm:text-left">
                <div class="flex flex-row">
                  <slot name="icon">
                    <div class="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-300 sm:mx-0 sm:size-10">
                      <svg
                        aria-hidden="true"
                        class="size-6 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                  </slot>
                  <div class="ml-2 flex w-full flex-col justify-center border-b-2 border-white">
                    <slot name="title">
                      <h3 id="modal-title" class="text-white-900 text-base font-semibold leading-6">
                        Default title
                      </h3>
                    </slot>
                  </div>
                </div>
                <div class="min-w-64">
                  <slot name="body">
                    <div class="mt-2">
                      <p class="text-sm text-gray-300">
                        This is the default body.
                      </p>
                    </div>
                  </slot>
                </div>
              </div>
            </div>
          </div>
          <div class="items-center justify-center px-4 pb-4 sm:flex sm:flex-row-reverse sm:px-6">
            <slot name="buttons">
              <button
                class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                type="button"
              >
                Continue
              </button>
              <button
                class="mt-3 inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 sm:mt-0 sm:w-auto"
                type="button"
              >
                Cancel
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
