// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025  Philipp Emanuel Weidmann <pew@worldwidemann.com>

import type { WritableDraft } from "immer";
import type React from "react";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { getState } from "@/lib/state";

/**
 * @interface BackendUI
 * @description Defines the structure for a backend's user interface components
 * that can be dynamically injected into the application.
 * @property {string} backendName - The unique name of the backend.
 * @property {React.ReactNode} configurationTab - The React component to be rendered as a tab trigger (e.g., in ConnectionSetup).
 * @property {React.ReactNode} configurationPage - The React component to be rendered as the content page for the tab.
 */
export interface BackendUI {
  backendName: string;
  configurationTab: React.ReactNode;
  configurationPage: React.ReactNode;
}

/**
 * @interface CharacterUI
 * @description Defines the structure for a Character creation's user interface components
 * that can be dynamically injected into the application.
 * @property {string} GameRuleName - The unique name of the Game Rule being used like DnD5eCharacter.
 * @property {React.ReactNode} GameRuleTab - The React component to be rendered as a tab trigger (e.g., in ConnectionSetup).
 * @property {React.ReactNode} GameRulePage - The React component to be rendered as the content page for the tab.
 */
export interface CharacterUI {
  GameRuleName: string;
  GameRuleTab: React.ReactNode;
  GameRulePage: () => React.ReactNode;
}


/**
 * @interface PluginsState
 * @description Defines the shape of the Zustand store for managing plugin-related UI states.
 * This store holds arrays of dynamically added UI components from various plugins.
 * @property {BackendUI[]} backendUIs - An array of UI components provided by backend plugins.
 * @property {(nextStateOrUpdater: PluginsState | Partial<PluginsState> | ((state: WritableDraft<PluginsState>) => void), shouldReplace?: false) => void} set - The Zustand setter function to update the state.
 */
export interface PluginsState {
  backendUIs: BackendUI[];
  characterUIs: CharacterUI[];
  set: (
    nextStateOrUpdater: PluginsState | Partial<PluginsState> | ((state: WritableDraft<PluginsState>) => void),
    shouldReplace?: false,
  ) => void;
}

/**
 * @constant usePluginsStateStore
 * @description A Zustand store for managing plugin-related UI states.
 * It uses `immer` middleware to allow direct mutation of the draft state,
 * simplifying state updates while maintaining immutability.
 */
export const usePluginsStateStore = create<PluginsState>()(
  immer((set) => ({
    backendUIs: [], // Initial empty array for backend UI components
    characterUIs: [],
    set: set, // Expose the setter for direct state manipulation
  })),
);

/**
 * @function getPluginsState
 * @description A helper function to get the current state of the `usePluginsStateStore`.
 * This is useful for accessing the plugin UI state outside of React components.
 * @returns {PluginsState} The current state of the plugins store.
 */
export function getPluginsState(): PluginsState {
  return usePluginsStateStore.getState();
}

/**
 * @class Context
 * @description Provides a context object to plugins, allowing them to interact with the main application.
 * This class enables plugins to save their settings and register UI components.
 * @property {string} pluginName - The name of the plugin associated with this context instance.
 */
export class Context {
  pluginName: string;
  constructor(
    pluginName: string,
  ) {
    this.pluginName = pluginName;
  }

  /**
   * @method saveSettings
   * @description Saves the settings for the current plugin to the main application state.
   * This method should not be called from a plugin's `init` method or a narration hook
   * to avoid potential state inconsistencies during critical operations.
   * @param {Record<string, unknown>} settings - The settings object to save.
   * @throws {Error} If no settings object is found for the plugin.
   */
  saveSettings(settings: Record<string, unknown>): void {
    getState().set((state) => {
      for (const plugin of state.plugins) {
        if (plugin.name === this.pluginName) {
          plugin.settings = settings;
          return;
        }
      }

      throw new Error(`No settings object found for plugin ${this.pluginName}`);
    });
  }

  /**
   * @method addCharacterUI
   * @description Registers a Character UI component with the application.
   * This allows the plugin's UI to be displayed in the `CharacterSelect` screen.
   * @param {string} GameRuleName - The name of the Game Rule.
   * @param {React.ReactNode} GameRuleTab - The React component for the tab trigger.
   * @param {React.ReactNode} GameRulePage - The React component for the tab content.
   */
  addCharacterUI(GameRuleName: string, GameRuleTab: React.ReactNode, GameRulePage: () => React.ReactNode): void {
    getPluginsState().set((state) => {
      state.characterUIs.push({
        GameRuleName,
        GameRuleTab,
        GameRulePage,
      });
    });
  }

  /**
   * @method addBackendUI
   * @description Registers a backend UI component with the application.
   * This allows the plugin's UI to be displayed in the `ConnectionSetup` screen.
   * @param {string} backendName - The name of the backend.
   * @param {React.ReactNode} configurationTab - The React component for the tab trigger.
   * @param {React.ReactNode} configurationPage - The React component for the tab content.
   */
  addBackendUI(backendName: string, configurationTab: React.ReactNode, configurationPage: React.ReactNode): void {
    getPluginsState().set((state) => {
      state.backendUIs.push({
        backendName,
        configurationTab,
        configurationPage,
      });
    });
  }
}
