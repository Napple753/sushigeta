import { createI18n } from 'vue-i18n'

const messages = {
  ja: {
    app: {
      title: 'SUSHIGETA',
      subtitle: 'プレゼント交換アプリ',
      step: {
        input: '参加者入力',
        group: 'グループ分け',
        exchange: '交換実行',
        result: '結果発表',
      },
    },
    participant: {
      title: '参加者',
      add: '参加者を追加',
      remove: '削除',
      placeholder: '名前を入力',
      duplicate: '重複した名前があります',
      duplicateList: '重複している名前',
      empty: '名前を入力してください',
      count: '{count}人',
      list: '参加者一覧',
      bulkInput: '一括入力',
      bulkPlaceholder:
        '名前を改行で区切って入力してください\n例：\n田中太郎\n佐藤花子\n山田次郎',
      bulkAdd: '一括追加',
      clearAll: 'すべて削除',
      clearConfirm: 'すべての参加者を削除しますか？',
      noParticipants: '参加者がいません',
    },
    group: {
      title: 'グループ分け',
      instruction: 'ドラッグして参加者をグループに分けてください',
      keyboard: 'キーボード操作',
    },
    exchange: {
      title: '交換',
      start: '交換開始',
      checking: '交換可能性をチェック中...',
      impossible: '条件を満たす組合せが見つかりません（1000回試行）',
      ready: '交換可能です',
    },
    result: {
      title: '結果',
      oneByOne: '一人ずつ発表',
      summary: 'まとめ',
      next: '次へ',
      copy: 'コピー',
      print: '印刷',
      reset: 'リセット',
      from: 'から',
      to: 'へ',
    },
    common: {
      loading: '読み込み中...',
      error: 'エラーが発生しました',
      confirm: '確認',
      cancel: 'キャンセル',
      back: '戻る',
      ok: 'OK',
    },
  },
  en: {
    app: {
      title: 'SUSHIGETA',
      subtitle: 'Gift Exchange App',
      step: {
        input: 'Participant Input',
        group: 'Grouping',
        exchange: 'Exchange',
        result: 'Results',
      },
    },
    participant: {
      title: 'Participants',
      add: 'Add Participant',
      remove: 'Remove',
      placeholder: 'Enter name',
      duplicate: 'Duplicate names found',
      duplicateList: 'Duplicate names',
      empty: 'Please enter a name',
      count: '{count} people',
      list: 'Participant List',
      bulkInput: 'Bulk Input',
      bulkPlaceholder:
        'Enter names separated by line breaks\nExample:\nJohn Smith\nJane Doe\nMike Johnson',
      bulkAdd: 'Add All',
      clearAll: 'Clear All',
      clearConfirm: 'Are you sure you want to remove all participants?',
      noParticipants: 'No participants yet',
    },
    group: {
      title: 'Grouping',
      instruction: 'Drag participants to organize them into groups',
      keyboard: 'Keyboard Operation',
    },
    exchange: {
      title: 'Exchange',
      start: 'Start Exchange',
      checking: 'Checking exchange possibility...',
      impossible:
        'No valid combination found after 1000 attempts. Please adjust groups.',
      ready: 'Exchange is possible',
    },
    result: {
      title: 'Results',
      oneByOne: 'Reveal One by One',
      summary: 'Summary',
      next: 'Next',
      copy: 'Copy',
      print: 'Print',
      reset: 'Reset',
      from: 'from',
      to: 'to',
    },
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      confirm: 'Confirm',
      cancel: 'Cancel',
      back: 'Back',
      ok: 'OK',
    },
  },
}

export default createI18n({
  locale: navigator.language.startsWith('ja') ? 'ja' : 'en',
  fallbackLocale: 'en',
  messages,
  legacy: false,
})
