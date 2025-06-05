interface CompletionItem {
  caption: string;
  value: string;
  meta: string;
  score: number;
}

export class CustomCompleter {

  // 示例补全数据，实际使用时可以从props传入
  private completions: CompletionItem[] = [];

  public id: string = 'OutputFieldsCompleter';
  public prefix: string;

  constructor(completions?: CompletionItem[], prefix?: string) {
    this.completions = completions || [];
    this.prefix = prefix || '$';
  }

  getCompletions = (
    editor: any,
    session: any,
    pos: any,
    prefix: string,
    callback: (error: null, wordList: CompletionItem[]) => void
  ) => {
    // 获取当前行的文本
    const line = session.getLine(pos.row);
    // 获取光标位置
    const cursorPosition = pos.column;
    const cursorPrefix = this.prefix;

    // 检查是否在 $ 后面
    if (line[cursorPosition - 1] === cursorPrefix || (prefix.startsWith(cursorPrefix))) {
      // 过滤匹配的补全项
      const matches = this.completions.filter(item => 
        prefix === cursorPrefix || item.caption.toLowerCase().includes(prefix.toLowerCase())
      );
      
      callback(null, matches);
      return;
    }
    
    callback(null, []);
  };
} 