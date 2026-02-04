<template>
  <div aria-labelledby="modal-title" aria-modal="true" class="l-relative-position z-[60]" role="dialog">
    <div class="fixed inset-0 bg-gray-900/75 transition-opacity"/>
    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div class="flex min-h-full items-end l-items-main-center p-4 text-center sm:items-center sm:p-0">
        <div class="l-relative-position overflow-hidden text-left transition-all sm:my-8 sm:max-w-[75%] c-card-bg-2">
          <div class="bg-theme-bg px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 w-full text-center sm:mt-0 sm:text-left">
                <div class="l-flex-row">
                  <slot name="icon">
                    <div class="mx-auto flex size-12 shrink-0 l-items-cross-center l-items-main-center rounded-full bg-red-300 sm:mx-0 sm:size-10">
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
                  <div class="ml-2 l-flex-column w-full l-items-main-center">
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
          <div class="flex w-full l-items-cross-center l-items-main-center gap-4">
            <slot name="buttons">
              <button
                class="c-btn-bg-3"
                type="button"
              >
                Cancel
              </button>
              <button
                class="c-btn-secondary"
                type="button"
              >
                Continue
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
