/**
 * @swagger
 * definitions:
 *  question:
 *   type: object
 *   required:
 *     - club_id
 *     - uid
 *     - question
 *   properties:
 *     _id:
 *       type: objectId
 *       description: (기본 생성)
 *     club_id:
 *       type: objectId
 *       description: 동아리
 *     uid:
 *       type: objectId
 *       description: 질문 작성자 _id
 *     question:
 *       type: boolean
 *       description: 질문 내용
 *     answer:
 *       type: objectId
 *       description: 답변 _id
 *     isAnswered:
 *       type: boolean
 *       description: 답변 여부
 *     createdAt:
 *       type: string
 *       description: 질문 생성일
 */