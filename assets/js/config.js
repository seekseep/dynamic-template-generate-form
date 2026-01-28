const defaultConfig = {
  form: {
    "sections": [
      {
        "label": "基本情報",
        "condition": null,
        "fields": [
          {
            "label": "種別",
            "type": "select",
            "required": true,
            "options": [
              "-- 選択してください --",
              "個人",
              "企業"
            ]
          },
          {
            "id": "email",
            "name": "email",
            "label": "メールアドレス",
            "type": "email",
            "required": true
          }
        ]
      },
      {
        "label": "個人情報",
        "condition": [{ "field": "種別", "value": "個人" }],
        "fields": [
          [
            {
              "label": "姓",
              "type": "text",
              "required": true
            },
            {
              "label": "名",
              "type": "text",
              "required": true
            }
          ]
        ]
      },
      {
        "label": "企業情報",
        "condition": [{ "field": "種別", "value": "企業" }],
        "fields": [{
          "label": "会社名",
          "type": "text",
          "required": true
        }, {
          "label": "従業員数",
          "type": "select",
          "required": true,
          "options": [
            "-- 選択してください --",
            "1-10名",
            "11-50名",
            "51-100名",
            "100名以上"
          ],
        }
        ]
      },
      {
        "label": "追加情報",
        "condition": null,
        "fields": [
          {
            "label": "訪問予定日",
            "type": "date",
            "required": false,
          },
          {
            "label": "ご希望の連絡方法",
            "type": "radio",
            "required": true,
            "options": [
              "メール",
              "電話",
              "SMS"
            ]
          },
          {
            "label": "ご関心のある分野",
            "type": "checkbox",
            "required": false,
            "options": [
              "マーケティング",
              "営業",
              "技術",
              "カスタマーサポート"
            ],
          },
          {
            "label": "コメント",
            "type": "textarea",
            "required": false
          }
        ]
      }
    ]
  },
  template: {
    "sections": [
      {
        "label": "基本情報",
        "condition": null,
        "content": "【申込内容】\nメールアドレス: {{email}}\n種別: {{種別}}\n"
      },
      {
        "label": "個人情報",
        "condition": [{ "field": "種別", "value": "個人" }],
        "content": "【個人情報】\nお名前: {{姓}} {{名}}\n"
      },
      {
        "label": "企業情報",
        "condition": [{ "field": "種別", "value": "企業" }],
        "content": "【企業情報】\n会社名: {{会社名}}\n従業員数: {{従業員数}}\n"
      },
      {
        "label": "追加情報",
        "condition": null,
        "content": "【追加情報】\n訪問予定日: {{訪問予定日}}\nご希望の連絡方法: {{ご希望の連絡方法}}\nご関心のある分野: {{ご関心のある分野}}\nコメント:\n{{コメント}}\n"
      }
    ]
  }
}
