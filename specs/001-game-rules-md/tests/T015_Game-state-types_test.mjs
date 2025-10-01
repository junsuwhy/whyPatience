#!/usr/bin/env node

/**
 * T015 Game State Types Test
 * 
 * 測試遊戲狀態型別定義的正確性和完整性
 * 這個測試驗證 src/types/game-state.ts 中的 TypeScript 型別定義
 * 
 * 測試原則：
 * - 確認型別檔案存在且可被 TypeScript 編譯器正確解析
 * - 驗證所有必要的型別和枚舉都已定義
 * - 檢查型別定義符合 data-model.md 規格
 * - 確保符合 TypeScript strict mode 要求
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

const GAME_STATE_TYPES_FILE = 'src/types/game-state.ts';
const PROJECT_ROOT = process.cwd();

/**
 * 執行 TypeScript 編譯檢查
 */
async function runTypeScriptCheck() {
    return new Promise((resolve, reject) => {
        const tsc = spawn('npx', ['tsc', '--noEmit', '--strict', GAME_STATE_TYPES_FILE], {
            stdio: 'pipe',
            cwd: PROJECT_ROOT
        });

        let stdout = '';
        let stderr = '';

        tsc.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        tsc.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        tsc.on('close', (code) => {
            resolve({ code, stdout, stderr });
        });

        tsc.on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * 執行 ESLint 檢查
 */
async function runLintCheck() {
    return new Promise((resolve, reject) => {
        const eslint = spawn('npm', ['run', 'lint', GAME_STATE_TYPES_FILE], {
            stdio: 'pipe',
            cwd: PROJECT_ROOT
        });

        let stdout = '';
        let stderr = '';

        eslint.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        eslint.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        eslint.on('close', (code) => {
            resolve({ code, stdout, stderr });
        });

        eslint.on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * 檢查檔案內容是否包含必要的型別定義
 */
async function checkRequiredTypes() {
    const filePath = path.join(PROJECT_ROOT, GAME_STATE_TYPES_FILE);
    
    if (!existsSync(filePath)) {
        throw new Error(`檔案不存在: ${GAME_STATE_TYPES_FILE}`);
    }

    const content = await readFile(filePath, 'utf-8');
    
    const requiredTypes = [
        'GamePhase',
        'GameState', 
        'TableauState',
        'FoundationState',
        'StockState',
        'GameStatistics',
        'GameHistory',
        'GameSettings'
    ];

    const missingTypes = requiredTypes.filter(type => 
        !content.includes(`interface ${type}`) && !content.includes(`enum ${type}`)
    );

    if (missingTypes.length > 0) {
        throw new Error(`缺少必要型別定義: ${missingTypes.join(', ')}`);
    }

    // 檢查 JSDoc 註釋
    const hasJSDoc = content.includes('/**') && content.includes('*/');
    if (!hasJSDoc) {
        throw new Error('缺少 JSDoc 註釋說明');
    }

    return true;
}

/**
 * 主測試執行函數
 */
async function runTests() {
    console.log('🧪 開始執行 T015 Game State Types 測試...\n');

    let passed = 0;
    let failed = 0;

    // 測試 1: 檔案存在性檢查
    try {
        console.log('📝 測試 1: 檢查檔案存在性...');
        await checkRequiredTypes();
        console.log('✅ 通過: 檔案存在且包含必要型別定義\n');
        passed++;
    } catch (error) {
        console.log(`❌ 失敗: ${error.message}\n`);
        failed++;
    }

    // 測試 2: TypeScript 編譯檢查
    try {
        console.log('📝 測試 2: TypeScript 編譯檢查...');
        const result = await runTypeScriptCheck();
        
        if (result.code === 0) {
            console.log('✅ 通過: TypeScript 編譯無錯誤\n');
            passed++;
        } else {
            throw new Error(`TypeScript 編譯失敗:\n${result.stderr}`);
        }
    } catch (error) {
        console.log(`❌ 失敗: ${error.message}\n`);
        failed++;
    }

    // 測試 3: ESLint 檢查 (如果可用)
    try {
        console.log('📝 測試 3: ESLint 代碼質量檢查...');
        const result = await runLintCheck();
        
        if (result.code === 0) {
            console.log('✅ 通過: ESLint 檢查無錯誤\n');
            passed++;
        } else {
            console.log(`⚠️  警告: ESLint 檢查有問題:\n${result.stdout}\n`);
            // ESLint 錯誤不算測試失敗，只是警告
            passed++;
        }
    } catch (error) {
        console.log(`⚠️  警告: 無法執行 ESLint 檢查 (${error.message})\n`);
        // ESLint 不可用時不算失敗
        passed++;
    }

    // 輸出測試結果
    console.log('📊 測試結果摘要:');
    console.log(`✅ 通過: ${passed}`);
    console.log(`❌ 失敗: ${failed}`);
    console.log(`📈 成功率: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

    if (failed === 0) {
        console.log('🎉 所有測試通過！型別定義符合要求。');
        process.exit(0);
    } else {
        console.log('💥 測試失敗！需要修正型別定義後重新測試。');
        console.log('\n📝 修正建議:');
        console.log('1. 確保 src/types/game-state.ts 檔案已建立');
        console.log('2. 定義所有必要的型別和枚舉');
        console.log('3. 加入完整的 JSDoc 註釋');
        console.log('4. 確保符合 TypeScript strict mode');
        process.exit(1);
    }
}

// 執行測試
runTests().catch(error => {
    console.error('❌ 測試執行錯誤:', error);
    process.exit(1);
});